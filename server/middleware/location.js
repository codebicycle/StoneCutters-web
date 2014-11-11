'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var _ = require('underscore');
        var fs = require('fs');
        var path = require('path');
        var asynquence = require('asynquence');
        var statsd  = require('../modules/statsd')();
        var utils = require('../../shared/utils');
        var errorPath = path.resolve('server/templates/error.html');
        var closedPath = path.resolve('server/templates/closed.html');
        var translations = require('../../app/translations');

        return function middleware(req, res, next) {
            if (_.contains(excludedUrls.all, req.path)) {
                return next();
            }

            var host = req.rendrApp.session.get('host');
            var shortHost = req.rendrApp.session.get('shortHost');
            var platform = req.rendrApp.session.get('platform');
            var locationUrl = req.rendrApp.session.get('locationUrl');
            var location = req.param('location');
            var siteLocation;
            var previousLocation;

            if (typeof location === 'string' && !location) {
                return res.redirect(302, utils.removeParams(utils.link(req.protocol + '://' + host + req.originalUrl, req.rendrApp), 'location'));
            }
            if (platform === 'desktop') {
                siteLocation = req.rendrApp.session.get('siteLocation');
                if (location) {
                    location = host.replace(shortHost, location);
                    return res.redirect(302, utils.removeParams(utils.link(req.protocol + '://' + location + req.originalUrl, req.rendrApp), 'location'));
                }
            }
            else {
                previousLocation = req.rendrApp.session.get('siteLocation');
                siteLocation = location || previousLocation || shortHost.replace(platform + '.m.', 'www.');
                if (!location && siteLocation.indexOf('www.')) {
                    return res.redirect(302, utils.link(req.protocol + '://' + host + req.originalUrl, req.rendrApp, {
                        location: siteLocation
                    }));
                }
                else if (location && !siteLocation.indexOf('www.')) {
                    req.rendrApp.session.persist({
                        siteLocation: siteLocation
                    });
                    return res.redirect(302, utils.removeParams(utils.link(req.protocol + '://' + host + req.originalUrl, req.rendrApp), 'location'));
                }
            }

            function fetch(done) {
                function callback(err, response) {
                    var params = null;

                    if (err) {
                        if (err.status !== 404) {
                            return done.fail(err);
                        }
                        if (previousLocation) {
                            params = {
                                location: previousLocation
                            };
                        }
                        done.abort();
                        locationUrl = host.replace(shortHost, locationUrl);
                        return res.redirect(302, utils.removeParams(utils.link(req.protocol + '://' + locationUrl + req.originalUrl, req.rendrApp), 'location'));
                    }
                    done(response.location);
                }

                req.rendrApp.fetch({
                    location: {
                        model: 'Location',
                        params: {
                            location: siteLocation
                        }
                    }
                }, {
                    readFromCache: false,
                    writeToCache: false,
                    store: true
                }, callback);
            }

            function success(done, location) {
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
                if (err.status === 400) {
                    return fs.readFile(closedPath, 'utf8', function callback(err, html) {
                        var template = _.template(html);

                        res.send(template({
                            dictionary: translations['en-US']
                        }));
                    });
                }
                statsd.increment(['Unknown Location', 'middleware', 'location', 'error']);
                res.status(500).sendfile(errorPath);
            }

            asynquence().or(fail)
                .then(fetch)
                .then(success)
                .val(next);
        };
    };
};
