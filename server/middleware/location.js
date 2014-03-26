'use strict';

module.exports = function(dataAdapter) {

    return function loader() {
        var asynquence = require('asynquence');
        var _ = require('underscore');

        return function middleware(req, res, next) {
            var app = req.rendrApp;
            var siteLocation = app.getSession('siteLocation');
            var cache = require('../../cache')();

            function fetchLocation(done) {
                var key = ['location', siteLocation];

                function notCached(done) {
                    var api = {
                        body: {},
                        url: '/locations/' + siteLocation
                    };

                    dataAdapter.promiseRequest(req, api, done);
                }

                cache.get(key, done, notCached);
            }

            function fetchTopCities(done) {
                var key = ['topCities', siteLocation];

                function notCached(done) {
                    var api = {
                        body: {},
                        url: '/countries/' + siteLocation + '/topcities'
                    };

                    function success(result) {
                        var topCities = {
                            models: result.data,
                           _byId: {},
                            metadata: result.metadata
                        };

                        topCities.models.forEach(function sort(city) {
                            topCities._byId[city.id] = city;
                        });
                        done(topCities);
                    }

                    dataAdapter.promiseRequest(req, api, success, done.fail);
                }

                cache.get(key, done, notCached);
            }

            function getCity(done, location, topCities) {
                var storedLocation = app.getSession('location');
                var cityId = req.param('cityId', null);
                var cities;
                var city;

                // TODO: Find a better way to get a particular city.
                if (storedLocation) {
                    cities = storedLocation.cities;
                    city = storedLocation.city;
                }
                else {
                    cities = _.clone(topCities);
                }
                if (cityId) {
                    city = cities._byId[cityId];
                }
                location.topCities = topCities;
                location.cities = cities;
                location.city = city;
                done(location);
            }

            function store(done, location) {
                if (location.city) {
                    siteLocation = location.city.url;
                }
                app.updateSession({
                    siteLocation: siteLocation,
                    location: location
                });
                done();
            }

            function fail(msg) {
                console.log('Failure: ' + msg);
                res.send(400, msg);
            }

            asynquence().or(fail)
                .gate(fetchLocation, fetchTopCities)
                .then(getCity)
                .then(store)
                .val(next);
        };

    };

};
