var http = require("http");


/**
 * envSetup middleware.
 * Here we call smaug in order to define which type of web we have to show.
 * Also set up the site location (domain)
 */
module.exports = function envSetup() {
    
    var urlVarsSetup = function (req){
        var host = req.get('host');
        var path = req._parsedUrl.pathname;
        var url = req.originalUrl;
        var siteLoc = host.substring(0,host.indexOf(":")).replace("m","www");
        var viewType = 'unknown';

        switch(path){
            case '/': viewType = 'home';
            break;
            case '/items': viewType = 'listing';
            break;
            //emulate /items/* match
            case '/items/'+ path.slice('/items/'.length): viewType = 'itemPage';
            break;
            default: viewType = 'unknown';
            break;
        }

        global.siteLocation = siteLoc;
        global.path = path;
        global.url = url;
        global.viewType = viewType;
    };
   
    return function(req, res, next) {

        urlVarsSetup(req);

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