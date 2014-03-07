'use strict';

module.exports = function(dataAdapter) {

    return function loader() {
        var asynquence = require('asynquence');

        return function middleware(req, res, next) {
            var app = req.rendrApp;
            var siteLocation = app.getSession('siteLocation');

            function fetchLocation(done) {
                var api = {
                    body: {},
                    url: '/locations/' + siteLocation
                };

                dataAdapter.promiseRequest(req, api, done);
            }

            function fetchTopCities(done) {
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

            if (!app.getSession('updateRequired')) {
                return next();
            }

            function store(done, location, topCities) {

                // TODO: Find a better way to get a particular city.
                location.cities = topCities;
                location.topCities = topCities;
                app.updateSession({
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
                .then(store)
                .val(next);
        };

    };

};
