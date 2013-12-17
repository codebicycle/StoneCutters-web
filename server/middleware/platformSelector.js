var enabled = true;
var http = require("http");


/**
 * PlatformSelector middleware.
 * Here we call smaug in order to define which type of web we have to show.
 */
module.exports = function platformSelector(onoff) {
    
    enabled = (onoff == 'on') ? true : false;
    
    return function(req, res, next) {

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
                //console.log("Device "+JSON.stringify(device));
                
                if (device.web_platform == 'wap') {
                    req.platform = "basic";
                    global.platform = "basic";
                }else{
                    req.platform = "enhanced";
                    global.platform = "enhanced";
                }

                next();
            });

        }).on('error', function(e) {
            console.log("Got error: " + e.message);
        });
    }
};