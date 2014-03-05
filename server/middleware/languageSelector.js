'use strict';

var http = require('http');
var asynquence = require('asynquence');

var defaultDictionary = require('../defaultDictionary');

/**
 * languageSelector middleware.
 * Here we call smaug in order to define which language we have to show.
 * Also fetch the default dictionary.
 */
module.exports = function languageSelector() {

    return function languageSelectorLoader(dataAdapter) {

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
                console.log('Hitting SMAUG to know the correct language');
                http.get('http://api-v2.olx.com/countries/' + siteLoc + '/languages', function languageGetCallback(res) {
                    var output = '';

                    res.on('data', function languageDataCallback(chunk) {
                        output += chunk;
                    });

                    res.on('end', function languageEndCallback() {
                        var languages = JSON.parse(output);
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
                    });
                }).on('error', function languageErrorCallback(error) {
                    done.fail('Got error: ' + error.message);
                });
            }

            function getDictionary(done, selectedLanguage){
                http.get('http://api-v2.olx.com/dictionaries/' + selectedLanguage.id,function dictionariesGetCallback(response){
                    var output = '';

                    response.on('data', function dictionariesDataCallback(chunk) {
                        output += chunk;
                    });

                    response.on('end', function dictionariesEndCallback() {
                        var dictionary;
                        try {
                            dictionary = JSON.parse(output);
                        }
                        catch (e) {

                            // We must wait until smaug implements this call
                            //done.fail(output);
                            dictionary = defaultDictionary;
                        }
                        app.get('baseData').dictionary = dictionary;
                        app.get('session').baseData.dictionary = dictionary;
                        done();
                    });
                }).on('error', function dictionariesErrorCallback(error) {
                    done.fail('Got error: ' + error.message);
                });
            }

            asynquence(callGetLanguageCallback)
            .then(getDictionary)
            .then(languageSelectorFinishCallback)
            .or(languageSelectorErrorCallback);
        };

    };

};
