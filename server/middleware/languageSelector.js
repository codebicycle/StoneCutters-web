var http = require('http');
var asynquence = require('asynquence');

/**
 * languageSelector middleware.
 * Here we call smaug in order to define which language we have to show.
 * Also fetch the default dictionary.
 */
module.exports = function languageSelector() {

    function getLanguages(done, siteLoc) {
        console.log('Hitting SMAUG to know the correct language');
        http.get('http://api-v2.olx.com/countries/'+siteLoc+'/languages',function languageGetCallback(res) {
            var output = '';

            res.on('data', function languageDataCallback(chunk) {
                output += chunk;
            });

            res.on('end', function languageEndCallback() {
                var languages = JSON.parse(output);
                var selectedLanguage = null;

                languages.forEach(function processLanguage(entry) {
                    if(entry.default == true){
                        selectedLanguage = entry;
                    }
                });

                global.selectedLanguage = selectedLanguage;
                req.selectedLanguage = selectedLanguage;
                global.languages = languages;
                req.languages = languages;

                done(selectedLanguage);
            });
        }).on('error', function languageErrorCallback(error) {
            done.fail('Got error: ' + error.message);
        });
    }

    function getDictionaries (done, selectedLanguage){
        http.get('http://api-v2.olx.com/dictionaries/' + selectedLanguage.id,function dictionariesGetCallback(response){
            var output = '';

            response.on('data', function dictionariesDataCallback(chunk) {
                output += chunk;
            });

            response.on('end', function dictionariesEndCallback() {
                global.currentDictionary = JSON.parse(output);
                done();
            });
        }).on('error', function dictionariesErrorCallback(error){
            done.fail('Got error: ' + error.message);
        });
    }

    return function languageSelector(req, res, next) {
        var host = req.get('host');
        var siteLoc = host.substring(0,host.indexOf(':')).replace('m','www');
        global.siteLocation = siteLoc;

        function callGetLanguageCallback(done) {
            getLanguages(done, siteLoc);
        }

        function languageSelectorFinishCallback() {
            next();
        }

        function languageSelectorErrorCallback(msg) {
            console.log('Failure: ' + msg);
        }

        asynquence(callGetLanguageCallback)
        .then(getDictionary)
        .then(languageSelectorFinishCallback)
        .or(languageSelectorErrorCallback);

    }
};
