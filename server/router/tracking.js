'use strict';

module.exports = function trackingRouter(app, dataAdapter) {
    var _ = require('underscore');
    var querystring = require('querystring');
    var config = require('../../shared/config');
    var configAnalytics = require('../../app/analytics/config');
    var Session = require('../../shared/session');
    var utils = require('../../shared/utils');
    var tracking = require('../../shared/tracking');
    var graphite = require('../graphite')();
    var statsd  = require('../statsd')();
    var Tracker = require('../tracker');
    var analytics = require('../../app/analytics');
    var env = config.get(['environment', 'type'], 'development');

    function getUserAgent(req) {
        return (req.get('user-agent') || utils.defaults.userAgent);
    }

    function defaultOptions(req) {
        return {
            headers: {
                'User-Agent': getUserAgent(req)
            }
        };
    }

    (function analyticsInfo() {
        app.get('/analytics', handler);

        var paramsGenerators = {
            ati: function generateAtiParams(req) {
                var countryId = 2;
                var params = {};
                var atiConfig;

                if (env !== 'production') {
                    countryId = 0;
                }
                atiConfig = utils.get(configAnalytics, ['ati', 'paths', countryId]);
                if (atiConfig) {
                    params.id = atiConfig.siteId;
                    params.host = atiConfig.logServer;
                }
                return params;
            },
            google: function generateGoogleParams(req) {
                var params = {};

                params.host = req.host;
                params.clientId = (req.rendrApp.session.get('clientId') || 'ac33b570-90e2-4669-ba83-d3fa017c0de0');
                return params;
            }
        };

        function generateDefaultParams(req) {
            var sid = req.rendrApp.session.get('sid');
            var location = (req.rendrApp.session.get('location') || {});
            var params = {};

            if (sid) {
                params.sid = sid;
            }
            params.id = analytics.google.getId();
            params.page = 'test';
            params.random = Math.round(Math.random() * 1000000);
            params.referer = (req.rendrApp.session.get('referer') || '-');
            params.platform = (req.rendrApp.session.get('platform') || utils.defaults.platform);
            params.clientId = (req.rendrApp.session.get('clientId') || 'ac33b570-90e2-4669-ba83-d3fa017c0de0').substr(24);
            params.osNm = 'Others';
            params.locNm = 'TestLocation';
            params.custom = ['{"page_name":"test","platform":"', params.platform, '","category":"test"}'].join('');
            return params;
        }

        function handler(req, res) {
            Session.call(req.rendrApp, false, {
                isServer: true
            }, callback);

            function callback() {
                var trackers = {
                    ati: true,
                    google: true,
                    graphite: true
                };
                var defaultParams = generateDefaultParams(req);
                var json = {};
                var paramsGenerator;
                var params;
                var data;
                var api;

                _.each(trackers, function(x, type) {
                    paramsGenerator = paramsGenerators[type];
                    if (paramsGenerator) {
                        params = paramsGenerator.call(this, req, defaultParams);
                    }
                    api = tracking.generate(type, _.defaults({}, params, defaultParams), false, true);
                    data = {};
                    _.each(api.params, function(value, key) {
                        data[key] = encodeURIComponent(value);
                    });
                    json[type] = [api.url, '?', querystring.stringify(data)].join('');
                });

                res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                res.json({
                    trackers: json
                });
            }
        }
    })();

    (function pageview() {
        app.get('/analytics/pageview.gif', handler);

        function graphiteTracking(req) {
            graphite.send([req.query.locNm, 'pageview', req.query.platform], 1, '+');
            statsd.increment([req.query.locNm, 'pageview', req.query.platform]);
            graphite.send([req.query.locNm, 'devices', req.query.osNm, req.query.platform], 1, '+');
            statsd.increment([req.query.locNm, 'devices', req.query.osNm, req.query.platform]);
        }

        function googleTracking(req) {
            var analytic = new Tracker('google', {
                id: analytics.google.getId(),
                host: req.host,
                clientId: req.query.cliId
            });
            var options = defaultOptions(req);

            options.method = 'post';
            analytic.track({
                page: req.query.page,
                referer: req.query.referer,
                ip: req.rendrApp.session.get('ip'),
                userAgent: getUserAgent(req)
            }, options);
        }

        function googleTrackingQA2(req) {
            var analytic = new Tracker('google', {
                id: 'UA-31226936-4',
                host: req.host,
                clientId: req.query.cliId
            });
            var options = defaultOptions(req);

            options.method = 'post';
            analytic.track({
                page: req.query.page,
                referer: req.query.referer,
                ip: req.rendrApp.session.get('ip'),
                userAgent: getUserAgent(req)
            }, options);
        }

        function atiTracking(req) {
            var countryId = req.query.locId;
            var atiConfig;
            var analytic;
            var options;

            if (env !== 'production') {
                countryId = 0;
            }
            atiConfig = utils.get(configAnalytics, ['ati', 'paths', countryId]);
            if (atiConfig) {
                options = defaultOptions(req);
                analytic = new Tracker('ati', {
                    id: atiConfig.siteId,
                    host: atiConfig.logServer,
                    clientId: req.query.cliId.substr(24)
                });

                analytic.track({
                    page: req.query.page,
                    referer: req.query.referer,
                    custom: req.query.custom
                }, options);
            }
        }

        function handler(req, res) {
            var image = 'R0lGODlhAQABAPAAAP39/QAAACH5BAgAAAAALAAAAAABAAEAAAICRAEAOw==';

            image = new Buffer(image, 'base64');
            res.set('Content-Type', 'image/gif');
            res.set('Content-Length', image.length);
            res.end(image);

            Session.call(req.rendrApp, false, {
                isServer: true
            }, callback);

            function callback() {
                graphiteTracking(req);
                googleTracking(req);
                googleTrackingQA2(req);
                atiTracking(req);
            }
        }
    })();

    (function pageevent() {
        app.get('/analytics/pageevent.gif', handler);

        function googleTracking(req) {
            var analytic = new Tracker('google-event', {
                id: analytics.google.getId(),
                host: req.host,
                clientId: req.query.cliId
            });
            var options = defaultOptions(req);

            options.method = 'post';
            analytic.track(_.extend({
                ip: req.rendrApp.session.get('ip'),
                userAgent: getUserAgent(req)
            }, req.query), options);
        }

        function atiTracking(req) {
            var countryId = req.query.locId;
            var atiConfig;
            var analytic;
            var options;

            if (env !== 'production') {
                countryId = 0;
            }
            atiConfig = utils.get(configAnalytics, ['ati', 'paths', countryId]);
            if (atiConfig) {
                options = defaultOptions(req);
                analytic = new Tracker('ati-event', {
                    id: atiConfig.siteId,
                    host: atiConfig.logServer,
                    clientId: req.query.cliId.substr(24)
                });
                analytic.track({
                    custom: req.query.custom,
                    url: req.query.url
                }, options);
            }
        }

        function handler(req, res) {
            var image = 'R0lGODlhAQABAPAAAP39/QAAACH5BAgAAAAALAAAAAABAAEAAAICRAEAOw==';

            image = new Buffer(image, 'base64');
            res.set('Content-Type', 'image/gif');
            res.set('Content-Length', image.length);
            res.end(image);

            Session.call(req.rendrApp, false, {
                isServer: true
            }, callback);

            function callback() {
                googleTracking(req);
                atiTracking(req);
            }
        }
    })();

    (function graphiteGif() {
        app.get('/analytics/graphite.gif', handler);

        var metrics = {
            pageview: function(req) {
                graphite.send([req.query.locNm, 'pageview', req.query.platform], 1, '+');
                statsd.increment([req.query.locNm, 'pageview', req.query.platform]);
                graphite.send([req.query.locNm, 'devices', req.query.osNm, req.query.platform], 1, '+');
                statsd.increment([req.query.locNm, 'devices', req.query.platform]);
            },
            reply: {
                success: function(req) {
                    graphite.send([req.query.location, 'reply', 'success', req.query.platform], 1, '+');
                    statsd.increment([req.query.location, 'reply', 'success', req.query.platform]);
                },
                error: function(req) {
                    graphite.send([req.query.location, 'reply', 'error', req.query.platform], 1, '+');
                    statsd.increment([req.query.location, 'reply', 'error', req.query.platform]);
                }
            }
        };

        function noop() {}

        function handler(req, res) {
            var image = 'R0lGODlhAQABAPAAAP39/QAAACH5BAgAAAAALAAAAAABAAEAAAICRAEAOw==';

            image = new Buffer(image, 'base64');
            res.set('Content-Type', 'image/gif');
            res.set('Content-Length', image.length);
            res.end(image);

            Session.call(req.rendrApp, false, {
                isServer: true
            }, callback);

            function callback() {
                utils.get(metrics, (req.query.metric || '').split(','), noop)(req);
            }
        }
    })();
};
