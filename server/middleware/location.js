'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var config = require('../config');
        var asynquence = require('asynquence');
        var _ = require('underscore');

        return function middleware(req, res, next) {
            if (_.contains(excludedUrls.all, req.path)) {
                return next();
            }

            var previousLocation = req.rendrApp.session.get('siteLocation');
            var siteLocation = req.param('location', previousLocation);
            var host = req.rendrApp.session.get('host');
            var index = host.indexOf(':');
            var platform;

            function fetch(done) {
                function after(err, result) {
                    if (err) {
                        done.abort();
                        return res.redirect(301, '/' + (previousLocation ? '?location=' + previousLocation : ''));
                    }
                    done(result.location);
                }

                req.rendrApp.fetch({
                    location: {
                        model: 'Location',
                        params: {
                            location: siteLocation
                        }
                    }
                }, {
                    readFromCache: false
                }, after);
            }

            function check(done, location) {
                var url = location.get('url');

                if (host.split(':').shift().split('.').pop() !== url.split('.').pop()) {
                    done.abort();
                    return res.redirect(301, '/' + (previousLocation ? '?location=' + previousLocation : ''));
                }
                done(location);
            }

            function store(done, location) {
                var current = location.get('current');

                if (current) {
                    siteLocation = current.url;
                }
                req.rendrApp.session.persist({
                    siteLocation: siteLocation
                });
                req.rendrApp.session.update({
                    location: location.toJSON()
                });
                done();
            }

            function fail(err) {
                res.send(400, err);
            }

            if (!siteLocation) {
                siteLocation = (index === -1) ? host : host.substring(0, index);
                platform = siteLocation.split('.').shift().length;
                if (siteLocation.indexOf(config.get(['publicEnvironments', 'testing', 'host'], '.m-testing.olx.com')) === platform) {
                    siteLocation = platform + config.get(['publicEnvironments', 'testing', 'mask'], '.m.olx.com');
                }
                else if (siteLocation.indexOf(config.get(['publicEnvironments', 'staging', 'host'], '.m-staging.olx.com')) === platform) {
                    siteLocation = platform + config.get(['publicEnvironments', 'staging', 'mask'], '.m.olx.com');
                }
                siteLocation = siteLocation.replace(siteLocation.slice(0, siteLocation.indexOf('.m.') + 2),'www');
                previousLocation = siteLocation;
            }
            else if (_.isArray(siteLocation)) {
                siteLocation = siteLocation[0];
            }
            if (previousLocation && previousLocation.split('.').pop() !== siteLocation.split('.').pop()) {
                return res.redirect(301, '/?location=' + previousLocation);
            }
            asynquence().or(fail)
                .then(fetch)
                .then(check)
                .then(store)
                .val(next);
        };

    };

};
