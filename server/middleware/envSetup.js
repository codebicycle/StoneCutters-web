var http = require("http");


/**
 * envSetup middleware.
 * Here we call smaug in order to define which type of web we have to show.
 * Also set up the site location (domain)
 */
module.exports = function envSetup() {
    
    var urlVarsSetup = function (req){
        var host = req.headers.host;
        var path = req._parsedUrl.pathname;
        var url = req.originalUrl;

        var index = host.indexOf(":");
        var siteLoc = index == -1? host: host.substring(0,index);
        siteLoc = siteLoc.replace("m","www");

        console.log("<DEBUG CONSOLE LOG> Extracting location ID from host header:" + siteLoc);
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
    	console.log("<DEBUG CONSOLE LOG> Hitting SMAUG to know the platform");
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
                    case "html4": template = "standard";
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