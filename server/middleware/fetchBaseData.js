'use strict';

var asynquence = require('asynquence');

module.exports = function(dataAdapter) {

    return function fetchBaseDataLoader() {

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

            function getCategories(done) {
                var api = {
                    body: {},
                    url: '/countries/' + global.siteLocation + '/categories'
                };

                function requestDone(results) {
                    var categories = {
                        models: results,
                        _byId: {}
                    };

                    categories.models.forEach(function processCategory(category) {
                        categories._byId[category.id] = category;
                    });

                    done(categories);
                }

                dataAdapter.promiseRequest(req, api, requestDone, done.fail);
            }

            function getLocation(done) {
                var api = {
                    body: {},
                    url: '/locations/' + global.siteLocation
                };

                dataAdapter.promiseRequest(req, api, done);
            }

            function getTopCities (done) {
                var api = {
                    body: {},
                    url: '/countries/' + global.siteLocation + '/topcities'
                };

                function requestDone(result) {
                    var topCities = {
                        models: result.data,
                       _byId: {},
                        metadata: result.metadata
                    };

                    topCities.models.forEach(function processCity(city) {
                        topCities._byId[city.id] = city;
                    });
                    done(topCities);
                }

                dataAdapter.promiseRequest(req, api, requestDone, done.fail);
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
                res.send(400, msg);
            }

            asynquence()
            .gate(getCategories,getLocation,getTopCities)
            .then(saveDataFetchBaseCallback)
            .or(fetchBaseDataErrorCallback);
        };

    };

};
