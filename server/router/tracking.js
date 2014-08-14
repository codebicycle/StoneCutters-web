'use strict';

module.exports = function trackingRouter(app, dataAdapter) {
    var _ = require('underscore');
    var ua = require('universal-analytics');
    var config = require('../../shared/config');
    var configAnalytics = require('../../app/analytics/config');
    var utils = require('../../shared/utils');
    var statsd  = require('../statsd')();
    var Tracker = require('../tracker');
    var env = config.get(['environment', 'type'], 'development');
    var image = 'R0lGODlhAQABAPAAAP39/QAAACH5BAgAAAAALAAAAAABAAEAAAICRAEAOw==';

    function defaultRequestOptions(req) {
        return {
            headers: {
                'User-Agent': (req.get('user-agent') || utils.defaults.userAgent),
                'Accept-Encoding': 'gzip,deflate,sdch',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
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

        function googleTracking(req) {
            var analytic = new Tracker('google', {
                id: 'UA-31226936-4',
                host: req.host
            });
            var options = defaultRequestOptions(req);
            var language = req.rendrApp.session.get('selectedLanguage');

            if (language) {
                options.language = language.toLowerCase();
            }
            analytic.track({
                page: req.query.page,
                referer: req.query.referer,
                ip: req.rendrApp.session.get('ip'),
                clientId: req.rendrApp.session.get('clientId'),
                userAgent: options.headers['User-Agent']
            }, options);
        }

        function googleTrackingUniversal(req) {
            var options = defaultRequestOptions(req);
            var language = req.rendrApp.session.get('selectedLanguage');
            var visitor;

            if (language) {
                language = language.toLowerCase();
            }

            visitor = ua('UA-50718833-1', req.rendrApp.session.get('clientId'), options);
            visitor.pageview({
                dh: req.host,
                dp: req.query.page,
                dr: req.query.referer,
                ua: options.headers['User-Agent'],
                ul: language,
                uip: req.rendrApp.session.get('ip')
            }).send();
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
                options = defaultRequestOptions(req);
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
            var location = req.rendrApp.session.get('siteLocation');
            var gif;

            req.rendrApp.session.persist({
                sessionStarted: true
            });
            gif = new Buffer(image, 'base64');
            res.set('Content-Type', 'image/gif');
            res.set('Content-Length', gif.length);
            if (location && (~location.indexOf('.olx.cl') || ~location.indexOf('.olx.jp'))) {
                console.log('[OLX_DEBUG]', location, 'set-cookie:', res._headers['set-cookie']);
            }
            res.end(gif);

            graphiteTracking(req, sessionStarted);
            googleTracking(req);
            googleTrackingUniversal(req);
            atiTracking(req);
        }
    })();

    (function pageevent() {
        app.get('/analytics/pageevent.gif', handler);

        function googleTracking(req) {
            var analytic = new Tracker('google-event', {
                id: 'UA-31226936-4',
                host: req.host
            });
            var options = defaultRequestOptions(req);

            analytic.track(_.extend({
                ip: req.rendrApp.session.get('ip'),
                clientId: req.rendrApp.session.get('clientId'),
                userAgent: options.headers['User-Agent']
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
                options = defaultRequestOptions(req);
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
