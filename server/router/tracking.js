'use strict';

module.exports = function trackingRouter(app, dataAdapter) {
    var _ = require('underscore');
    var querystring = require('querystring');
    var config = require('../../shared/config');
    var configAnalytics = require('../../app/analytics/config');
    var Session = require('../../shared/session');
    var utils = require('../../shared/utils');
    var tracking = require('../../shared/tracking');
    var statsd  = require('../statsd')();
    var Tracker = require('../tracker');
    var analytics = require('../../app/analytics');
    var env = config.get(['environment', 'type'], 'development');
    var image = 'R0lGODlhAQABAPAAAP39/QAAACH5BAgAAAAALAAAAAABAAEAAAICRAEAOw==';

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

        function graphiteTracking(req, isNewSession) {
            var platform = req.rendrApp.session.get('platform');
            var osName = req.rendrApp.session.get('osName') || 'Others';

            statsd.increment([req.query.locNm, 'pageview', platform]);
            statsd.increment([req.query.locNm, 'devices', osName, platform]);
            if (isNewSession) {
                statsd.increment([req.query.locNm, 'sessions', 'new', platform]);
            }
            else {
                statsd.increment([req.query.locNm, 'sessions', 'returning', platform]);
            }
        }

        function googleTracking(req, isNewSession) {
            var analytic = new Tracker('google', {
                id: analytics.google.getId(),
                host: req.host
            });
            var options = defaultOptions(req);

            options.method = 'post';
            analytic.track({
                page: req.query.page,
                referer: req.query.referer,
                ip: req.rendrApp.session.get('ip'),
                clientId: req.rendrApp.session.get('clientId'),
                userAgent: getUserAgent(req),
                language: req.rendrApp.session.get('selectedLanguage').toLowerCase()
            }, options);
        }

        function googleTrackingQA2(req, isNewSession) {
            var analytic = new Tracker('google', {
                id: 'UA-31226936-4',
                host: req.host
            });
            var options = defaultOptions(req);

            options.method = 'post';
            analytic.track({
                page: req.query.page,
                referer: req.query.referer,
                ip: req.rendrApp.session.get('ip'),
                clientId: req.rendrApp.session.get('clientId'),
                userAgent: getUserAgent(req),
                language: req.rendrApp.session.get('selectedLanguage').toLowerCase()
            }, options);
        }

        function atiTracking(req, isNewSession) {
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
                    host: atiConfig.logServer
                });

                analytic.track({
                    page: req.query.page,
                    referer: req.query.referer,
                    custom: req.query.custom,
                    clientId: req.rendrApp.session.get('clientId').substr(24)
                }, options);
            }
        }

        function handler(req, res) {
            Session.call(req.rendrApp, false, {
                isServer: true
            }, callback);

            function callback() {
                var sessionStarted = !!req.rendrApp.session.get('sessionStarted');

                if (~req.rendrApp.session.get('siteLocation').indexOf('.olx.cl')) {
                    console.log('[OLX_DEBUG] clientId:', req.rendrApp.session.get('clientId'), ' | diff:', diff);
                }

                req.rendrApp.session.persist({
                    sessionStarted: true
                });

                image = new Buffer(image, 'base64');
                res.set('Content-Type', 'image/gif');
                res.set('Content-Length', image.length);
                res.end(image);

                graphiteTracking(req, sessionStarted);
                googleTracking(req, sessionStarted);
                googleTrackingQA2(req, sessionStarted);
                atiTracking(req, sessionStarted);
            }
        }
    })();

    (function pageevent() {
        app.get('/analytics/pageevent.gif', handler);

        function googleTracking(req) {
            var analytic = new Tracker('google-event', {
                id: analytics.google.getId(),
                host: req.host
            });
            var options = defaultOptions(req);

            options.method = 'post';
            analytic.track(_.extend({
                ip: req.rendrApp.session.get('ip'),
                clientId: req.rendrApp.session.get('clientId'),
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
                    host: atiConfig.logServer
                });
                analytic.track({
                    custom: req.query.custom,
                    url: req.query.url,
                    clientId: req.rendrApp.session.get('clientId').substr(24)
                }, options);
            }
        }

        function handler(req, res) {
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
                statsd.increment([req.query.locNm, 'pageview', req.query.platform]);
                statsd.increment([req.query.locNm, 'devices', req.query.osNm, req.query.platform]);
            },
            reply: {
                success: function(req) {
                    statsd.increment([req.query.location, 'reply', 'success', req.query.platform]);
                },
                error: function(req) {
                    statsd.increment([req.query.location, 'reply', 'error', req.query.platform]);
                }
            }
        };

        function noop() {}

        function handler(req, res) {
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
