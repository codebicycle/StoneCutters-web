'use strict';

module.exports = function(dataAdapter) {

    return function loader() {
        var asynquence = require('asynquence');
        var _ = require('underscore');
        var debug = require('debug')('arwen:middleware:location');

        return function middleware(req, res, next) {
            var app = req.rendrApp;
            var siteLocation = app.getSession('siteLocation');
            var location;
            var topCities;

            function fetchLocation(done) {
                dataAdapter.get(req, '/locations/' + siteLocation, done.errfcb);
            }

            function fetchTopCities(done) {
                dataAdapter.get(req, '/countries/' + siteLocation + '/topcities', done.errfcb);
            }

            function parse(done, _location, _topCities) {
                location = _location[1];
                topCities = {
                    models: _topCities[1].data,
                   _byId: {},
                    metadata: _topCities[1].metadata
                };

                topCities.models.forEach(function sort(city) {
                    topCities._byId[city.id] = city;
                });
                done();
            }

            function getCity(done) {
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
                done();
            }

            function store(done) {
                if (location.city) {
                    siteLocation = location.city.url;
                }
                app.updateSession({
                    siteLocation: siteLocation,
                    location: location
                });
                done();
            }

            function fail(err) {
                debug('%s %j', 'ERROR', err);
                res.send(400, err);
            }

            asynquence().or(fail)
                .gate(fetchLocation, fetchTopCities)
                .then(parse)
                .then(getCity)
                .then(store)
                .val(next);
        };

    };

};
