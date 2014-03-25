'use strict';

module.exports = function(dataAdapter) {

    return function loader() {
        var asynquence = require('asynquence');
        var defaultDictionaries = require('../defaultDictionaries');

        return function middleware(req, res, next) {
            var app = req.rendrApp;
            var siteLocation = app.getSession('siteLocation');
            var cache = require('../../cache')();

            function fetchLanguages(done) {
                var key = ['languages', siteLocation];

                function notCached(done) {
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

                cache.get(key, done, notCached);
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
                var key = ['dictionaries', selectedLanguage];

                function notCached(done) {
                    var api = {
                        body: {},
                        url: '/dictionaries/' + selectedLanguage
                    };

                    // Waiting for SMAUG to implement this call so we need to use a fake fail function
                    function fail() {
                        done(defaultDictionaries[selectedLanguage] || defaultDictionaries[1]);
                    }

                    dataAdapter.promiseRequest(req, api, done, /*done.*/fail);
                }

                function cached(dictionary) {
                    done(languages, selectedLanguage, dictionary);
                }

                cache.get(key, done, notCached, cached);
            }

            function store(done, languages, selectedLanguage, dictionary) {
                app.updateSession({
                    languages: languages,
                    selectedLanguage: selectedLanguage,
                    dictionary: dictionary
                });
                done();
            }

            function fail(msg) {
                console.log('Middleware Failure (Language): ' + msg);
                res.send(400, msg);
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
