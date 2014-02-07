var http = require("http");


/**
 * languageSelector middleware.
 * Here we call smaug in order to define which language we have to show.
 * Also fetch the default dictionary.
 */
module.exports = function languageSelector() {
    
    
    return function(req, res, next) {
        
        if(enabled == false){
            next();
        }

        //Extract the url from the request.
        var host = req.get('host');
        //Replace m for www in order to get the location id.
        var siteLoc = host.substring(0,host.indexOf(":")).replace("m","www"); 
        global.siteLocation = siteLoc; //Site location (location id)

	    var userAgent = null;
		if (req) {
			userAgent = req.get('user-agent');
		}
    	userAgentEncoded = encodeURIComponent(userAgent);
    	console.log("Hitting SMAUG to know the correct language");
        http.get("http://api-v2.olx.com/countries/"+siteLoc+"/languages",function(res){
	        var output = '';

            res.on('data', function (chunk) {
                output += chunk;
            });

            res.on('end', function() {
                var languages = JSON.parse(output);
                
                var selectedLanguage = null;
                
                console.log(languages);

                languages.forEach(function(entry){
                    if(entry.default == true){
                        selectedLanguage = entry;
                    }
                });
                
                http.get("http://api-v2.olx.com/dictionaries/"+selectedLanguage.id,function(response){
                    var output = '';

                    response.on('data', function (chunk) {
                        output += chunk;
                    });

                    response.on('end', function() {
                        global.currentDictionary = JSON.parse(output);
                        next();
                    });
                }).on('error', function(e){
                    console.log("Got error: " + e.message);
                });

                global.selectedLanguage = selectedLanguage;
                req.selectedLanguage = selectedLanguage;
                global.languages = languages;
                req.languages = languages;
            });
        }).on('error', function(e) {
            console.log("Got error: " + e.message);
        });
    }
};