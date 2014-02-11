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
          
          var categories = {
            "models": obj,
            "_byId": {}
          };

          obj.forEach(function(category) {
            categories._byId[category.id] = category;
          });

          app.set('baseData', {
            "categories": categories,
            "siteLocation": global.siteLocation,
            "platform": global.platform,
            "template": global.template,
            "path":global.path, 
            "url":global.url, 
            "viewType":global.viewType
          });
          req.updateSession('baseData', {
            "categories": categories,
            "siteLocation": global.siteLocation,
            "platform": global.platform,
            "template": global.template,
            "path":global.path, 
            "url":global.url, 
            "viewType":global.viewType
          });

          next();
      });
            
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });

  };
};