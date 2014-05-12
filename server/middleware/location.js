'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var asynquence = require('asynquence');
        var _ = require('underscore');

        return function middleware(req, res, next) {
            if (~excludedUrls.indexOf(req.path)) {
                return next();
            }

            var app = req.rendrApp;
            var previousLocation = app.getSession('siteLocation');
            var siteLocation = req.param('cityId', previousLocation);
            var location;
            var topCities;

            function fetchLocation(done) {
                function after (err, response, _location) {
                    if (!err) {
                        return done(_location);
                    }
                    siteLocation = previousLocation;
                    dataAdapter.get(req, '/locations/' + siteLocation, done.errfcb);
                }

                dataAdapter.get(req, '/locations/' + siteLocation, after);
            }

            function fetchTopCities(done) {
                dataAdapter.get(req, '/countries/' + siteLocation + '/topcities', done.errfcb);
            }

            function parse(done, _location, _topCities) {
                location = _location;
                topCities = {
                    models: _topCities[1].data,
                   _byId: {},
                    metadata: _topCities[1].metadata
                };

                topCities.models.forEach(function sort(city) {
                    topCities._byId[city.url] = city;
                });
                done();
            }

            function getCity(done) {
                location.topCities = topCities;
                if (location.children && location.children[0] && location.children[0].children && location.children[0].children[0]) {
                    location.city = location.children[0].children[0];
                }
                done();
            }

            function store(done) {
                if (location.city) {
                    siteLocation = location.city.url;
                }
                app.persistSession({
                    location: location,
                    siteLocation: siteLocation
                });
                done();
            }

            function fail(err) {
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
