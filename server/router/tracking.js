'use strict';

module.exports = function trackingRouter(app, dataAdapter) {
    var _ = require('underscore');
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
            var sessionStarted = !!req.rendrApp.session.get('sessionStarted');
            var ip = req.rendrApp.session.get('ip');
            var gif;

            req.rendrApp.session.persist({
                sessionStarted: true
            });
            gif = new Buffer(image, 'base64');
            res.set('Content-Type', 'image/gif');
            res.set('Content-Length', gif.length);
            res.end(gif);

            if (!ip.indexOf('192.') || !ip.indexOf('10.')) {
                console.log('[OLX_DEBUG]', ip, _.keys(req.headers).join(',') , _.values(req.headers).join(','));
            }
            graphiteTracking(req, sessionStarted);
            googleTracking(req, sessionStarted);
            googleTrackingQA2(req, sessionStarted);
            atiTracking(req, sessionStarted);
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
            var gif = new Buffer(image, 'base64');

            res.set('Content-Type', 'image/gif');
            res.set('Content-Length', gif.length);
            res.end(gif);

            googleTracking(req);
            atiTracking(req);
        }
    })();

    (function graphiteGif() {
        app.get('/analytics/graphite.gif', handler);

        var metrics = {
            pageview: function(req, options) {
                statsd.increment([req.query.locNm, 'pageview', options.platform]);
                statsd.increment([req.query.locNm, 'devices', options.osName, options.platform]);
            },
            reply: {
                success: function(req, options) {
                    statsd.increment([req.query.location, 'reply', 'success', options.platform]);
                },
                error: function(req, options) {
                    statsd.increment([req.query.location, 'reply', 'error', options.platform]);
                }
            }
        };

        function noop() {}

        function handler(req, res) {
            var gif = new Buffer(image, 'base64');

            res.set('Content-Type', 'image/gif');
            res.set('Content-Length', gif.length);
            res.end(gif);

            utils.get(metrics, (req.query.metric || '').split(','), noop)(req, {
                platform: req.rendrApp.session.get('platform'),
                osName: req.rendrApp.session.get('osName') || 'Others'
            });
        }
    })();
};
