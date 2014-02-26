var http = require("http");
var ASQ = require("asynquence");

/**
 * languageSelector middleware.
 * Here we call smaug in order to define which language we have to show.
 * Also fetch the default dictionary.
 */
module.exports = function languageSelector() {

    function getLanguages(done, siteLoc){
        console.log("Hitting SMAUG to know the correct language");
        http.get("http://api-v2.olx.com/countries/"+siteLoc+"/languages",function languageGetCallback(res){
            var output = '';

            res.on('data', function languageDataCallback(chunk) {
                output += chunk;
            });

            res.on('end', function languageEndCallback() {
                var languages = JSON.parse(output);
                var selectedLanguage = null;
                
                languages.forEach(function processLanguage(entry){
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
        }).on('error', function languageErrorCallback(e) {
            done.fail("Got error: " + e.message);
        });
    }

    function getDictionaries (done, selectedLanguage){
        http.get("http://api-v2.olx.com/dictionaries/"+selectedLanguage.id,function dictionariesGetCallback(response){
            var output = '';

            response.on('data', function dictionariesDataCallback(chunk) {
                output += chunk;
            });

            response.on('end', function dictionariesEndCallback() {
                global.currentDictionary = JSON.parse(output);

                done();
            });
        }).on('error', function dictionariesErrorCallback(e){
            done.fail("Got error: " + e.message);
        });
    }

    return function languageSelector(req, res, next) {

        //Extract the url from the request.
        var host = req.get('host');
        //Replace m for www in order to get the location id.
        var siteLoc = host.substring(0,host.indexOf(":")).replace("m","www"); 
        global.siteLocation = siteLoc; //Site location (location id)

        ASQ(function callGetLanguageCallback(done){
            getLanguages(done, siteLoc);
        })
        .then(getDictionary)
        .then(function languageSelectorFinishCallback(){
            next();
        })
        .or(function languageSelectorErrorCallback(msg){
            console.log("Failure: " + msg);
        });

    }
};
