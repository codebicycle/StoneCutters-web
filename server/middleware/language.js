'use strict';

module.exports = function(dataAdapter) {

    return function loader() {
        var asynquence = require('asynquence');
        var defaultDictionary = require('../defaultDictionary');

        return function middleware(req, res, next) {
            var app = req.rendrApp;
            var siteLocation = app.getSession('siteLocation');

            function fetchLanguages(done) {
                var api = {
                    body: {},
                    url: '/countries/' + siteLocation + '/languages'
                };

                dataAdapter.promiseRequest(req, api, done);
            }

            function select(done, languages) {
                var selectedLanguage = null;

                languages.forEach(function select(entry) {
                    if(entry.default){
                        selectedLanguage = entry;
                    }
                });
                if (!selectedLanguage) {
                    selectedLanguage = languages[0];
                }
                done(languages, selectedLanguage);
            }

            function fetchDictionary(done, languages, selectedLanguage) {
                var api = {
                    body: {},
                    url: '/dictionaries/' + selectedLanguage.id
                };

                function success(dictionary) {
                    done(languages, selectedLanguage, dictionary);
                }

                // Waiting for SMAUG to implement this call so we need to use a fake fail function
                function fail() {
                    success(defaultDictionary);
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

            function fail(msg) {
                console.log('Failure: ' + msg);
                res.send(400, msg);
            }

            if (!app.getSession('updateRequired')) {
                return next();
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
