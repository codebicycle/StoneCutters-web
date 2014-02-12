var http = require("http");
var async = require("async");

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

    function fetchBaseData(url, callback) {
      http.get(url, function(res) {
        var output = '';

        res.on('data', function(chunk) {
          output += chunk;
        }).on('error', function(e) {
          console.log("Got error: " + e.message);
          callback(e);
        }).on('end', function() {
          callback(null, JSON.parse(output));
        });  
      });
    }

    async.parallel([function(callback) {

      fetchBaseData("http://api-v2.olx.com/countries/" + global.siteLocation + "/categories", function(err, results) {
        if (err) {
          return callback(err);
        }

        var categories = {
          "models": results,
          "_byId": {}
        };
        categories.models.forEach(function(category) {
          categories._byId[category.id] = category;
        });

        callback(null, categories);
      });

    }, function(callback) {
      
      fetchBaseData("http://api-v2.olx.com/locations/" + global.siteLocation, callback);

    }, function(callback) {

      fetchBaseData("http://api-v2.olx.com/countries/" + global.siteLocation + "/topcities", function(err, result) {
        if (err) {
          return callback(err);
        }

        var topcities = {
          "models": result.data,
          "_byId": {},
          "metadata": result.metadata
        };
        topcities.models.forEach(function(city) {
          topcities._byId[city.id] = city;
        });

        callback(null, topcities);
      });

    }], function(err, results) {
      var categories = results[0];
      var location = results[1];
      location.topcities = results[2];
      location.cities = results[2];

      app.set('baseData', {
        "categories": categories,
        "siteLocation": global.siteLocation,
        "location": location,
        "platform": global.platform,
        "template": global.template,
        "path":global.path, 
        "url":global.url, 
        "viewType":global.viewType
      });

      req.updateSession('baseData', {
        "categories": categories,
        "siteLocation": global.siteLocation,
        "location": location,
        "platform": global.platform,
        "template": global.template,
        "path":global.path, 
        "url":global.url, 
        "viewType":global.viewType
      });

      next();
    });
  };
};