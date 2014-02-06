var enabled = true;
var http = require("http");


/**
 * envSetup middleware.
 * Here we call smaug in order to define which type of web we have to show.
 * Also set up the site location (domain)
 */
module.exports = function envSetup(onoff) {
    
    enabled = (onoff == 'on') ? true : false;
    
    return function(req, res, next) {

        var host = req.get('host');
        var siteLoc = host.substring(0,host.indexOf(":")).replace("m","www");

        global.siteLocation = siteLoc;

	    var userAgent = null;
		if (req) {
			userAgent = req.get('user-agent');
		}
    	userAgentEncoded = encodeURIComponent(userAgent);
    	console.log("Hitting SMAUG to know the platform");
        http.get("http://api-v2.olx.com/devices/"+userAgentEncoded,function(res){
	        var output = '';

            res.on('data', function (chunk) {
                output += chunk;
            });

            res.on('end', function() {
                var device = JSON.parse(output);
                var template = "basic";
                var platform = "wap";

                //console.log("Device "+JSON.stringify(device));

                platform = device.web_platform;

                switch(platform){
                    case "html5": template = "enhanced";
                    break;
                    case "html4": template = "enhanced";
                    break;
                    case "wap": template = "basic";
                    break;
                    default: template = "basic";
                    break;
                }

                req.platform = platform;
                global.platform = platform;
                req.template = template;
                global.template = template;

                next();
            });

        }).on('error', function(e) {
            console.log("Got error: " + e.message);
        });
    }
};