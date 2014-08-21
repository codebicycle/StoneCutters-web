'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var _ = require('underscore');
        var path = require('path');
        var asynquence = require('asynquence');
        var statsd  = require('../modules/statsd')();
        var utils = require('../../shared/utils');
        var errorPath = path.resolve('server/templates/error.html');

        return function middleware(req, res, next) {
            if (_.contains(excludedUrls.all, req.path)) {
                return next();
            }

            var app = req.rendrApp;
            var siteLocation = app.session.get('siteLocation');
            var location = app.session.get('location');
            var languages;
            var selectedLanguage;
            var userAgent = req.get('user-agent') || utils.defaults.userAgent;

            function fetchLanguages(done) {
                dataAdapter.get(req, '/countries/' + siteLocation + '/languages', done.errfcb);
            }

            function parse(done, response, _languages) {
                if (!_languages) {
                    console.log('[OLX_DEBUG] Empty languages response: ' + (response ? response.statusCode : 'no response') + ' for ' + userAgent + ' on ' + req.headers.host);
                    return fail(new Error());
                }
                // FIX: If SMAUG response is empty we hardcode values
                if (!_languages.length) {
                    _languages.push({
                        id: 85,
                        isocode: 'FA',
                        name: 'فارسی',
                        locale: 'fa-IR'
                    });
                    _languages.push({
                        id: 1,
                        isocode: 'EN',
                        name: 'English',
                        locale: 'en-US'
                    });

                }

                languages = {
                    models: _languages,
                    _byId: {}
                };

                languages.models.forEach(function each(language) {
                    languages._byId[language.locale] = language;
                });

                done();
            }

            function transition(done) {
                var lastSelectedLanguage = app.session.get('selectedLanguage');

                if (!isNaN(lastSelectedLanguage)) {
                    app.session.clear('selectedLanguage');
                }
                done();
            }

            function select(done) {
                var language = req.param('language', '');

                if (language && !languages._byId[language]) {
                    language = null;
                }
                selectedLanguage = language || app.session.get('selectedLanguage') || languages.models[0].locale;
                done();
            }

            function store(done) {
                app.session.update({
                    languages: languages
                });
                app.session.persist({
                    selectedLanguage: selectedLanguage
                });
                done();
            }

            function check(done) {
                var selectedLanguage = app.session.get('selectedLanguage');
                var language = req.param('language');
                var redirect;

                if (selectedLanguage === languages.models[0].locale && language) {
                    redirect = true;
                }
                else if (selectedLanguage !== languages.models[0].locale && !language) {
                    redirect = true;
                }
                else if (language && language !== selectedLanguage) {
                    redirect = true;
                }
                if (redirect) {
                    return res.redirect(302, utils.link(req.originalUrl, req.rendrApp));
                }
                done();
            }

            function fail(err) {
                statsd.increment([location.name, 'middleware', 'languages', 'error']);
                res.status(500).sendfile(errorPath);
            }

            asynquence().or(fail)
                .then(fetchLanguages)
                .then(parse)
                .then(transition)
                .then(select)
                .then(store)
                .then(check)
                .val(next);
        };

    };

};
