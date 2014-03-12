'use strict';

module.exports = function(dataAdapter) {

    return function loader() {
        var asynquence = require('asynquence');
        var defaultDictionaries = require('../defaultDictionaries');

        return function middleware(req, res, next) {
            var app = req.rendrApp;
            var siteLocation = app.getSession('siteLocation');

            function fetchLanguages(done) {
                var api = {
                    body: {},
                    url: '/countries/' + siteLocation + '/languages'
                };

                function success(results) {
                    var languages = {
                        models: results,
                        _byId: {}
                    };

                    languages.models.forEach(function iteration(language) {
                        languages._byId[language.id] = language;
                        if (language.default) {
                            languages.default = language.id;
                        }
                    });

                    done(languages);
                };

                if (!app.getSession('updateRequired')) {
                    return done(app.getSession('languages'));
                }

                dataAdapter.promiseRequest(req, api, success, done.fail);
            }

            function select(done, languages) {
                var language = parseInt(req.query.language);
                var selectedLanguage;

                if (language && !languages._byId[language]) {
                    language = null;
                }
                if (!app.getSession('updateRequired')) {
                    selectedLanguage = language || app.getSession('selectedLanguage');
                }
                else {
                    selectedLanguage = language || languages.default || languages.models[0].id;
                }

                done(languages, selectedLanguage);
            };

            function fetchDictionary(done, languages, selectedLanguage) {
                function fetch() {
                    var api = {
                        body: {},
                        url: '/dictionaries/' + languages._byId[selectedLanguage].id
                    };

                    dataAdapter.promiseRequest(req, api, success, /*done.*/fail);
                };

                function success(dictionary) {
                    done(languages, selectedLanguage, dictionary);
                };

                // Waiting for SMAUG to implement this call so we need to use a fake fail function
                function fail() {
                    success(defaultDictionaries[selectedLanguage]);
                };

                if (!app.getSession('updateRequired') && app.getSession('selectedLanguage') === selectedLanguage) {
                    return success(app.getSession('dictionary'));
                }
                fetch();
            };

            function store(done, languages, selectedLanguage, dictionary) {
                app.updateSession({
                    languages: languages,
                    selectedLanguage: selectedLanguage,
                    dictionary: dictionary
                });
                done();
            };

            function fail(msg) {
                console.log('Failure: ' + msg);
                res.send(400, msg);
            };

            asynquence().or(fail)
                .then(fetchLanguages)
                .then(select)
                .then(fetchDictionary)
                .then(store)
                .val(next);
        };

    };

};
