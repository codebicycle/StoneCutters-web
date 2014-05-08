'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var asynquence = require('asynquence');

        return function middleware(req, res, next) {
            if (~excludedUrls.indexOf(req.path)) {
                return next();
            }

            var app = req.rendrApp;
            var siteLocation = app.getSession('siteLocation');
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
                    languages._byId[language.isocode.toLowerCase()] = language;
                    if (language.default) {
                        languages.default = language.isocode.toLowerCase();
                    }
                });

                done();
            }

            function transition(done) {
                var lastSelectedLanguage = app.getSession('selectedLanguage');

                if (!isNaN(lastSelectedLanguage)) {
                    app.persistSession({
                        selectedLanguage: null
                    });
                }
                done();
            }

            function select(done) {

                var language = app.getSession('selectedLanguage');

                if(req.param('language')) {
                    language = req.param('language').toLowerCase();
                }
                if (language && !languages._byId[language]) {
                    language = null;
                }
                selectedLanguage = language || app.getSession('selectedLanguage') || languages.default || languages.models[0].isocode.toLowerCase();
                done();
            }

            function store(done) {
                app.updateSession({
                    languages: languages
                });
                app.persistSession({
                    selectedLanguage: selectedLanguage
                });
                done();
            }

            function fail(err) {
                res.send(400, err);
            }

            asynquence().or(fail)
                .then(fetchLanguages)
                .then(parse)
                .then(transition)
                .then(select)
                .then(store)
                .val(next);
        };

    };

};
