'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var asynquence = require('asynquence');
        var _ = require('underscore');

        return function middleware(req, res, next) {
            if (_.contains(excludedUrls.all, req.path)) {
                return next();
            }

            var app = req.rendrApp;
            var previousLocation = app.session.get('siteLocation');
            var siteLocation = req.param('location', previousLocation);
            var host = req.headers.host;
            var index = host.indexOf(':');
            var location;
            var topCities;
            var promise;

            function fetchLocation(done) {
                function after (err, response, _location) {
                    if (!err) {
                        return done(response, _location);
                    }
                    done.abort();
                    return res.redirect(301, '/?location=' + previousLocation);
                }

                dataAdapter.get(req, '/locations/' + siteLocation, after);
            }

            function getLocation(done, response, _location) {
                location = _location;
                done();
            }

            function fetchTopCities(done) {
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
                if (location.children && location.children[0]) {
                    location.current = location.children[0];
                    if (location.children[0].children && location.children[0].children[0]) {
                        location.current = location.children[0].children[0];
                    }
                }
                done();
            }

            function store(done) {
                if (location.current) {
                    siteLocation = location.current.url;
                }
                app.session.persist({
                    siteLocation: siteLocation
                });
                app.session.update({
                    location: location
                });
                done();
            }

            function fail(err) {
                res.send(400, err);
            }

            if (!siteLocation) {
                siteLocation = (index === -1) ? host : host.substring(0, index);
                siteLocation = siteLocation.replace(siteLocation.slice(0, siteLocation.indexOf('.m.') + 2),'www');
                previousLocation = siteLocation;
            }
            else if (_.isArray(siteLocation)) {
                siteLocation = siteLocation[0];
            }
            if (previousLocation && previousLocation.split('.').pop() !== siteLocation.split('.').pop()) {
                return res.redirect(301, '/?location=' + previousLocation);
            }
            promise = asynquence().or(fail)
                .then(fetchLocation)
                .then(getLocation);
            if (!_.contains(excludedUrls.data, req.path)) {
                promise
                    .then(fetchTopCities)
                    .then(parse);
            }
            promise
                .then(getCity)
                .then(store)
                .val(next);
        };

    };

};
