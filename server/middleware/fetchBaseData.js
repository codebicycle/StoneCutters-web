var http = require("http");

module.exports = function fetchBaseData() {
  return function fetchBaseData(req, res, next) {
    var app = req.rendrApp;
    var baseData = app.get('session').baseData;

    if (baseData){
      //still set the base data from ths session in case this is a deep link request
      app.set('baseData', baseData);
      next();
      return;
    }

    http.get("http://api-v2.olx.com/countries/www.olx.com.ar/categories",function(res){
      var output = '';

      res.on('data', function (chunk) {
          output += chunk;
      });

      res.on('end', function() {
          var obj = JSON.parse(output);
          //console.log("OBJ "+JSON.stringify(obj));
          app.set('baseData', {"categories":obj});
          req.updateSession('baseData', {"categories":obj});

          next();
      });
            
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });

  };
};