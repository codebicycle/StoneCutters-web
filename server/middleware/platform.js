'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var _ = require('underscore');
        var path = require('path');
        var asynquence = require('asynquence');
        var config = require('../config');
        var utils = require('../../shared/utils');
        var statsd  = require('../modules/statsd')();
        var Seo = require('../../app/modules/seo');
        var errorPath = path.resolve('server/templates/error.html');
        var migrated = config.get('migrated', []);

        return function platform(req, res, next) {
            if (_.contains(excludedUrls.all, req.path)) {
                return next();
            }
            var userAgent = utils.getUserAgent(req);
            var session = req.rendrApp.get('session');

            function fetch(done) {
                if (session.device) {
                    return done({}, session.device);
                }
                dataAdapter.get(req, '/devices/' + encodeURIComponent(userAgent), done.errfcb);
            }

            function success(done, response, body) {
                if (req.cookies && req.cookies.forcedPlatform) {
                    body.web_platform = req.cookies.forcedPlatform;
                }
                else if (body.isBrowser) {
                    body.web_platform = 'desktop';
                }
                else if (!body.web_platform) {
                    body.web_platform = utils.defaults.platform;
                }
                if (!session.platform) {
                    done.abort();
                    return redirect(body, false);
                }
                else if (!~userAgent.indexOf('Googlebot') && session.platform !== body.web_platform) {
                    done.abort();
                    return redirect(body, session.platform !== 'desktop');
                }
                session.device = body;
                session.platform = body.web_platform;
                res.locals({
                    platform: body.web_platform
                });
                done();
            }

            function redirect(device, hasPlatform) {
                var url;

                if (device.web_platform === 'desktop') {
                    if (!_.contains(migrated, session.locationUrl)) {
                        url = Seo.desktopizeUrl(req.originalUrl, {
                            protocol: req.protocol,
                            host: session.host,
                            path: req.path,
                            hasPlatform: hasPlatform
                        }, req.query);
                    }
                    else {
                        url = getDesktopUrl();
                    }
                }
                else {
                    url = getMobileUrl(device);
                }
                res.set('Vary', 'User-Agent');
                res.redirect(302, url);
            }

            function getDesktopUrl() {
                var url = [req.protocol, '://', session.locationUrl];

                if (session.port) {
                    url.push(':');
                    url.push(session.port);
                }
                url.push(req.originalUrl);
                return url.join('');
            }

            function getMobileUrl(device) {
                var url = [req.protocol, '://', device.web_platform];
                var host = session.host;
                var subHost = host.substr(host.indexOf('.'));

                if (subHost.indexOf('.m.')) {
                    url.push('.m');
                }
                url.push(subHost);
                url.push(req.originalUrl);
                url = url.join('');
                if (session.siteLocation) {
                    url = utils.params(url, 'location', session.siteLocation);
                }
                return url;
            }

            function fail(err) {
                statsd.increment(['Unknown Location', 'middleware', 'platform', 'error']);
                res.status(500).sendfile(errorPath);
            }

            asynquence().or(fail)
                .then(fetch)
                .then(success)
                .val(next);
        };

    };

};
