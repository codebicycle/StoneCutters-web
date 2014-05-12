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
            var siteLocation = req.param('location', previousLocation);
            var host = req.headers.host;
            var index = host.indexOf(':');
            var location;
            var topCities;

            function fetchLocation(done) {
                function after (err, response, _location) {
                    if (!err) {
                        return done(response, _location);
                    }
                    siteLocation = previousLocation;
                    dataAdapter.get(req, '/locations/' + siteLocation, done.errfcb);
                }

                dataAdapter.get(req, '/locations/' + siteLocation, after);
            }

            function fetchTopCities(done, response, _location) {
                location = _location;
                dataAdapter.get(req, '/countries/' + siteLocation + '/topcities', done.errfcb);
            }

            function parse(done, response, _topCities) {
                topCities = {
                    models: _topCities.data,
                   _byId: {},
                    metadata: _topCities.metadata
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

            if (!siteLocation) {
                siteLocation = (index === -1) ? host : host.substring(0, index);
                siteLocation = siteLocation.replace(siteLocation.slice(0, siteLocation.indexOf('.')),'www');
            }
            req.headers.host = siteLocation;
            if (previousLocation.split('.').pop() !== siteLocation.split('.').pop()) {
                return res.redirect('/?location=' + previousLocation);
            }
            asynquence().or(fail)
                .then(fetchLocation)
                .then(fetchTopCities)
                .then(parse)
                .then(getCity)
                .then(store)
                .val(next);
        };

    };

};
