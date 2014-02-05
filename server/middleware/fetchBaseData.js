var http = require("http");

module.exports = function fetchBaseData() {
  return function fetchBaseData(req, res, next) {
    var app = req.rendrApp;
    var baseData = app.get('session').baseData;

    //we have to check the platform because it might have changed if the user agent changed
    if (baseData && baseData.platform == global.platform){
      //still set the base data from ths session in case this is a deep link request
      app.set('baseData', baseData);
      next();
      return;
    }

    http.get("http://api-v2.olx.com/countries/"+global.siteLocation+"/categories",function(res){
      var output = '';

      res.on('data', function (chunk) {
          output += chunk;
      });

      res.on('end', function() {
          var obj = JSON.parse(output);

          app.set('baseData', {"categories":obj, "siteLocation":global.siteLocation, "platform":global.platform, "template":global.template});
          req.updateSession('baseData', {"categories":obj, "siteLocation":global.siteLocation, "platform":global.platform, "template":global.template});

          next();
      });
            
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });

  };
};