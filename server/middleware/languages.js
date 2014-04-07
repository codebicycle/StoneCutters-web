'use strict';

module.exports = function(dataAdapter) {

    return function loader() {
        var asynquence = require('asynquence');
        var defaultDictionaries = require('../defaultDictionaries');
        var debug = require('debug')('arwen:middleware:languages');

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
                }

                dataAdapter.promiseRequest(req, api, success, done.fail);
            }

            function select(done, languages) {
                var language = parseInt(req.param('language', 0));
                var selectedLanguage;

                if (language && !languages._byId[language]) {
                    language = null;
                }
                selectedLanguage = language || app.getSession('selectedLanguage') || languages.default || languages.models[0].id;
                done(languages, selectedLanguage);
            }

            function fetchDictionary(done, languages, selectedLanguage) {
                var api = {
                    body: {},
                    url: '/dictionaries/' + selectedLanguage
                };

                function success(dictionary) {
                    done(languages, selectedLanguage, dictionary);
                }

                // Waiting for SMAUG to implement this call so we need to use a fake fail function
                function fail() {
                    success(defaultDictionaries[selectedLanguage] || defaultDictionaries[1]);
                }

                dataAdapter.promiseRequest(req, api, success, /*done.*/fail);
            }

            function store(done, languages, selectedLanguage, dictionary) {
                app.updateSession({
                    languages: languages,
                    selectedLanguage: selectedLanguage,
                    dictionary: dictionary
                });
                done();
            }

            function fail(err) {
                debug('%s %j', 'ERROR', err);
                res.send(400, err);
            }

            asynquence().or(fail)
                .then(fetchLanguages)
                .then(select)
                .then(fetchDictionary)
                .then(store)
                .val(next);
        };

    };

};
