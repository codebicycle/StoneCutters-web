'use strict';

var asynquence = require('asynquence');
var defaultDictionary = require('../defaultDictionary');

/**
 * languageSelector middleware.
 * Here we call smaug in order to define which language we have to show.
 * Also fetch the default dictionary.
 */
module.exports = function(dataAdapter) {

    return function languageSelectorLoader() {

        return function languageSelector(req, res, next) {
            var app = req.rendrApp;
            var siteLoc = app.get('session').baseData.siteLocation;

            function callGetLanguageCallback(done) {
                getLanguages(done, siteLoc);
            }

            function languageSelectorFinishCallback() {
                next();
            }

            function languageSelectorErrorCallback(msg) {
                console.log('Failure: ' + msg);
                res.send(404, msg);
            }

            function getLanguages(done, siteLoc) {
                var api = {
                    body: {},
                    url: '/countries/' + siteLoc + '/languages'
                };

                function requestDone(languages) {
                    var selectedLanguage = null;

                    languages.forEach(function processLanguage(entry) {
                        if(entry.default){
                            selectedLanguage = entry;
                        }
                    });

                    if (!selectedLanguage) {
                        selectedLanguage = languages[0];
                    }

                    app.get('baseData').languages = languages;
                    app.get('baseData').language = selectedLanguage;
                    app.get('session').baseData.languages = languages;
                    app.get('session').baseData.language = selectedLanguage;

                    done(selectedLanguage);
                }

                console.log('Hitting SMAUG to know the correct language');
                dataAdapter.promiseRequest(req, api, requestDone, done.fail);
            }

            function getDictionary(done, selectedLanguage) {
                var api = {
                    body: {},
                    url: '/dictionaries/' + selectedLanguage.id
                };

                function requestDone(dictionary) {
                    app.get('baseData').dictionary = dictionary;
                    app.get('session').baseData.dictionary = dictionary;
                    done();
                }

                console.log('Hitting SMAUG to know the correct language');

                // Waiting for SMAUG to implement this call
                // dataAdapter.promiseRequest(req, api, requestDone, done.fail);
                dataAdapter.promiseRequest(req, api, requestDone, function requestFail() {
                    requestDone(defaultDictionary);
                });
            }

            asynquence(callGetLanguageCallback)
            .then(getDictionary)
            .then(languageSelectorFinishCallback)
            .or(languageSelectorErrorCallback);
        };

    };

};
