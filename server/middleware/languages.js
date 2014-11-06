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

            var location = req.rendrApp.session.get('location');
            var siteLocation = req.rendrApp.session.get('siteLocation');
            var userAgent = utils.getUserAgent(req);
            var selectedLanguage;
            var languages;

            function fetch(done) {
                dataAdapter.get(req, '/countries/' + siteLocation + '/languages', {
                    query: {
                        platform: req.rendrApp.session.get('platform')
                    },
                    store: true
                }, done.errfcb);
            }

            function parse(done, response, _languages) {
                if (!_languages) {
                    console.log('[OLX_DEBUG] Empty languages response: ' + (response ? response.statusCode : 'no response') + ' for ' + userAgent + ' on ' + req.headers.host);
                    return fail(new Error());
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
                var lastSelectedLanguage = req.rendrApp.session.get('selectedLanguage');

                if (!isNaN(lastSelectedLanguage)) {
                    req.rendrApp.session.clear('selectedLanguage');
                }
                done();
            }

            function select(done) {
                var language = req.param('language', '');

                if (language && !languages._byId[language]) {
                    language = null;
                }
                selectedLanguage = language || req.rendrApp.session.get('selectedLanguage') || languages.models[0].locale;
                done();
            }

            function store(done) {
                req.rendrApp.session.update({
                    languages: languages
                });
                req.rendrApp.session.persist({
                    selectedLanguage: selectedLanguage
                });
                done();
            }

            function check(done) {
                var selectedLanguage = req.rendrApp.session.get('selectedLanguage');
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
                .then(fetch)
                .then(parse)
                .then(transition)
                .then(select)
                .then(store)
                .then(check)
                .val(next);
        };

    };

};
