var http = require('http');
var asynquence = require('asynquence');

module.exports = function fetchBaseData() {
  return function fetchBaseData(req, res, next) {
    var app = req.rendrApp;
    var baseData = app.get('session').baseData;

    // we have to check the platform because it might have changed if the user agent changed
    if (baseData && baseData.platform == global.platform){

      // still set the base data from ths session in case this is a deep link request
      app.set('baseData', baseData);
      next();
      return;
    }

    function fetchBaseData(url, callback) {
      http.get(url, function fetchBaseGetCallback(res) {
        var output = '';

        res.on('data', function fetchBaseNewDataCallback(chunk) {
          output += chunk;
        }).on('error', function fetchBaseErrorCallback(error) {
          callback(error);
        }).on('end', function fetchBaseDoneCallback() {
          callback(null, JSON.parse(output));
        });
      });
    }

    function getCategories(done) {
      fetchBaseData('http://api-v2.olx.com/countries/' + global.siteLocation + '/categories', function fetchCountriesCallback(err, results) {
        if (err) {
          done.fail(err);
          return;
        }

        var categories = {
          models: results,
          _byId: {}
        };
        categories.models.forEach(function processCategory(category) {
          categories._byId[category.id] = category;
        });

        done(categories);
      });
    }

    function getLocation(done) {
      fetchBaseData('http://api-v2.olx.com/locations/' + global.siteLocation, function fetchLocationCallback(err, location){

        if (err) {
          done.fail(err);
          return;
        }

        done(location);
      });
    }

    function getTopCities (done) {
      fetchBaseData('http://api-v2.olx.com/countries/' + global.siteLocation + '/topcities', function fetchCitiesCallback(err, result) {
        if (err) {
          done.fail(err);
          return;
        }

        var topCities = {
          models: result.data,
          _byId: {},
          metadata: result.metadata
        };
        topCities.models.forEach(function processCity(city) {
          topCities._byId[city.id] = city;
        });

        done(topCities);
      });
    }

    function saveData(categories, location, topCities) {
      location.topCities = topCities;
      location.cities = topCities;

      // TODO: Find a better way to get a particular city.

      app.set('baseData', {
        categories: categories,
        siteLocation: global.siteLocation,
        location: location,
        platform: global.platform,
        template: global.template,
        path: global.path,
        url: global.url,
        viewType: global.viewType
      });

      req.updateSession('baseData', {
        categories: categories,
        siteLocation: global.siteLocation,
        location: location,
        platform: global.platform,
        template: global.template,
        path: global.path,
        url: global.url,
        viewType: global.viewType
      });
    }

    function saveDataFetchBaseCallback(done, categories, location, topCities) {
      saveData(categories, location, topCities);
      next();
    }

    function fetchBaseDataErrorCallback(msg) {
        console.log('Failure: ' + msg);
    }

    asynquence()
    .gate(getCategories,getLocation,getTopCities)
    .then(saveDataFetchBaseCallback)
    .or(fetchBaseDataErrorCallback);

  };
};
