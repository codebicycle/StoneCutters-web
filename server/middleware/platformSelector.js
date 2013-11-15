var enabled = true;
var http = require("http");


/**
 * SelectorPlatform middleware.
 * Here we call smaug in order to define which type of web we have to show.
 */
module.exports = function(onoff) {
    
    enabled = (onoff == 'on') ? true : false;
    
    return function(req, res, next) {

	    var userAgent = null;
		if (req) {
			userAgent = req.get('user-agent');
		}
    	userAgentEncoded = console.log(encodeURIComponent(userAgent));
    	console.log("Hitting SMAUG to know the platform");
        http.get("http://api-v2.olx.com/devices/"+userAgentEncoded,function(response){
	        	response.on('data', function (chunk) {
	        		var obj = JSON.parse(chunk.toString());
    				var isBrowserProp = obj["isBrowser"];
                    req.platform ="enhanced"
    				next();
  				});
            }).on('error', function(e) {
                console.log("Got error: " + e.message);
            });
    }
};