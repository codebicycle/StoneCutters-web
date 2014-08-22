'use strict';

module.exports = function trackingRouter(app, dataAdapter) {
    var _ = require('underscore');
    var statsd  = require('../modules/statsd')();
    var Tracker = require('../modules/tracker');
    var config = require('../../shared/config');
    var utils = require('../../shared/utils');
    var analytics = require('../../app/modules/analytics');
    var configAnalytics = require('../../app/modules/analytics/config');
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

        function graphiteTracking(req) {
            var platform = req.rendrApp.session.get('platform');
            var osName = req.rendrApp.session.get('osName') || 'Others';
            var hitCount = req.rendrApp.session.get('hitCount');
            var clientId = req.rendrApp.session.get('clientId');

            statsd.increment([req.query.locNm, 'pageview', platform]);
            statsd.increment([req.query.locNm, 'devices', osName, platform]);
            if (!hitCount) {
                statsd.increment([req.query.locNm, 'sessions', platform, 'error']);
            }
            else {
                // statsd.increment([req.query.locNm, 'sessions', platform, 'average', clientId]);
                if (hitCount > 1) {
                    statsd.increment([req.query.locNm, 'sessions', platform, 'recurrent']);
                }
                else {
                    statsd.increment([req.query.locNm, 'sessions', platform, 'new']);
                }
            }
        }

        function googleTracking(req, trackerId) {
            var analytic = new Tracker('googleGA', {
                id: trackerId,
                host: req.host
            });
            var language = req.rendrApp.session.get('selectedLanguage');
            var platform = req.rendrApp.session.get('platform');
            var osName = req.rendrApp.session.get('osName') || 'unknown';
            var osVersion = req.rendrApp.session.get('osVersion') || 'unknown';
            var options = defaultRequestOptions(req);
            var params = {
                page: req.query.page,
                referer: req.query.referer,
                ip: req.rendrApp.session.get('ip'),
                clientId: req.rendrApp.session.get('clientId'),
                userAgent: options.headers['User-Agent'],
                hitCount: req.rendrApp.session.get('hitCount')
            };

            if (language) {
                params.language = language.toLowerCase();
            }
            osName = osName.replace(/\s*/g, '').toLowerCase();
            params.dynamics = {
                utmcc: analytics.google.getUtmcc(req.rendrApp),
                utme: ['8(olx_visitor_country)9(', platform, '_', osName, '_', osVersion, '_', req.query.locNm, ')11(1)'].join('')
            };
            analytic.track(params, options);
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
            var gif = new Buffer(image, 'base64');
            var siteLocation = req.rendrApp.session.get('siteLocation') || req.query.locUrl;

            res.set('Content-Type', 'image/gif');
            res.set('Content-Length', gif.length);
            res.end(gif);

            graphiteTracking(req);
            if (~siteLocation.indexOf('.olx.com.ve')) {
                googleTracking(req, analytics.google.getId(siteLocation));
            }
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
