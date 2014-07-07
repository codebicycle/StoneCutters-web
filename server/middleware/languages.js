'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var asynquence = require('asynquence');
        var _ = require('underscore');
        var utils = require('../../shared/utils');

        return function middleware(req, res, next) {
            if (_.contains(excludedUrls.all, req.path)) {
                return next();
            }

            var app = req.rendrApp;
            var siteLocation = app.session.get('siteLocation');
            var location = app.session.get('location');
            var languages;
            var selectedLanguage;

            function fetchLanguages(done) {
                dataAdapter.get(req, '/countries/' + siteLocation + '/languages', done.errfcb);
            }

            function parse(done, response, _languages) {
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
                console.log(err.stack);
                res.send(400, err);
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
