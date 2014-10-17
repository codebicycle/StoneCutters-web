'use strict';

module.exports = function trackingRouter(app, dataAdapter) {
    var _ = require('underscore');
    var statsd  = require('../modules/statsd')();
    var Tracker = require('../modules/tracker');
    var config = require('../../shared/config');
    var utils = require('../../shared/utils');
    var tracking = require('../../app/modules/tracking');
    var configTracking = require('../../app/modules/tracking/config');
    var env = config.get(['environment', 'type'], 'development');
    var image = 'R0lGODlhAQABAPAAAP39/QAAACH5BAgAAAAALAAAAAABAAEAAAICRAEAOw==';

    function defaultRequestOptions(req, type, tracker) {
        var platform = req.rendrApp.session.get('platform');

        return {
            headers: {
                'User-Agent': utils.getUserAgent(req),
                'Accept-Encoding': 'gzip,deflate,sdch',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            success: function() {
                statsd.increment([req.query.locNm, 'tracking', type, tracker, platform, 'success']);
            },
            error: function() {
                statsd.increment([req.query.locNm, 'tracking', type, tracker, platform, 'error']);
            },
            fail: function() {
                statsd.increment([req.query.locNm, 'tracking', type, tracker, platform, 'fail']);
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

        function googleTracking(req, trackerId, host, page) {
            var analytic = new Tracker('googleGA', {
                id: trackerId,
                host: host || req.host
            });
            var language = req.rendrApp.session.get('selectedLanguage');
            var platform = req.rendrApp.session.get('platform');
            var osName = req.rendrApp.session.get('osName') || 'unknown';
            var osVersion = req.rendrApp.session.get('osVersion') || 'unknown';
            var options = defaultRequestOptions(req, 'pageview', 'google');
            var params = {
                page: page || req.query.page,
                referer: req.query.referer,
                ip: req.rendrApp.session.get('ip'),
                clientId: req.rendrApp.session.get('clientId'),
                userAgent: options.headers['User-Agent'],
                hitCount: req.rendrApp.session.get('hitCount'),
                visitor: tracking.google.getUtmcc(req.rendrApp),
                keyword: req.query.keyword
            };

            if (language) {
                params.language = language.toLowerCase();
            }
            osName = osName.replace(/\s*/g, '').toLowerCase();
            params.custom = ['8(olx_visitor_country)9(', platform, '_', osName, '_', osVersion, '_', req.query.locNm, ')11(1)'].join('');

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
            atiConfig = utils.get(configTracking, ['ati', 'paths', countryId]);
            if (atiConfig) {
                options = defaultRequestOptions(req, 'pageview', 'ati');
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

        function atiTrackingColombia(req) {
            var analytic;
            var options;

            if (env !== 'production') {
                return;
            }

            options = defaultRequestOptions(req, 'pageview', 'ati');
            analytic = new Tracker('ati', {
                id: 539154,
                host: 'logw306'
            });
            analytic.track({
                page: req.query.page,
                referer: req.query.referer,
                custom: req.query.custom,
                clientId: req.rendrApp.session.get('clientId').substr(24)
            }, options);
        }

        function handler(req, res) {
            var gif = new Buffer(image, 'base64');
            var location = req.rendrApp.session.get('siteLocation');
            var siteLocation = location || req.query.locUrl;
            var platform = req.rendrApp.session.get('platform') || utils.defaults.userAgent;
            var osName = req.rendrApp.session.get('osName');
            var osVersion = req.rendrApp.session.get('osVersion');
            var userAgent = utils.getUserAgent(req);
            var host = req.host;
            var page = req.query.page;
            var bot;
            var trackerId;
            var platformUrl;

            res.set('Content-Type', 'image/gif');
            res.set('Content-Length', gif.length);
            res.end(gif);

            if (!location) {
                if (!siteLocation) {
                    return/* console.log('[OLX_DEBUG]', 'no session or urlLoc', '|', userAgent, '|', req.originalUrl)*/;
                }
                return/* console.log('[OLX_DEBUG]', 'no session', '|', userAgent, '|', req.originalUrl)*/;
            }
            bot = isBot(userAgent, platform, osName, osVersion);
            if (bot) {
                return statsd.increment([req.query.locNm, 'bot', bot, platform]);
            }
            try {
                platformUrl = JSON.parse(req.query.custom).platform;
            }
            catch (err) {}
            if (platformUrl !== 'wap' && platformUrl !== 'html4' && platformUrl !== 'html5') {
                return/* console.log('[OLX_DEBUG]', 'ati', platform, platformUrl, userAgent, host, req.originalUrl)*/;
            }
            graphiteTracking(req);
            trackerId = tracking.google.getId(siteLocation);
            if (trackerId) {
                if (req.rendrApp.session.get('internet.org')) {
                    host = host.replace('olx', 'olx-internet-org');
                    page = '/internet.org' + page;
                }
                googleTracking(req, trackerId, host, page);
            }
            if (req.query.locUrl === 'www.olx.com.br' && platformUrl !== 'wap') {
                return;
            }
            if (req.query.locUrl !== 'www.olx.com.co') {
                atiTracking(req);
            }
            else {
                atiTrackingColombia(req);
            }
        }
    })();

    (function pageevent() {
        app.get('/analytics/pageevent.gif', handler);

        function googleTracking(req, trackerId, host) {
            var analytic = new Tracker('google-event', {
                id: trackerId,
                host: host
            });
            var options = defaultRequestOptions(req, 'pageevent', 'google');

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
            atiConfig = utils.get(configTracking, ['ati', 'paths', countryId]);
            if (atiConfig) {
                options = defaultRequestOptions(req, 'pageevent', 'ati');
                analytic = new Tracker('ati-event', {
                    id: atiConfig.siteId,
                    host: atiConfig.logServer
                });
                analytic.track({
                    custom: req.query.custom,
                    url: req.query.url,
                    clientId: req.rendrApp.session.get('clientId').substr(24),
                    dynamics: {
                        x20: req.rendrApp.session.get('platform') || utils.defaults.platform
                    }
                }, options);
            }
        }

        function handler(req, res) {
            var gif = new Buffer(image, 'base64');
            var location = req.rendrApp.session.get('siteLocation');
            var siteLocation = location || req.query.locUrl;
            var platform = req.rendrApp.session.get('platform') || utils.defaults.userAgent;
            var osName = req.rendrApp.session.get('osName');
            var osVersion = req.rendrApp.session.get('osVersion');
            var userAgent = utils.getUserAgent(req);
            var host = req.host;
            var bot;
            var trackerId;
            var platformUrl;

            res.set('Content-Type', 'image/gif');
            res.set('Content-Length', gif.length);
            res.end(gif);

            if (!location) {
                if (!siteLocation) {
                    return console.log('[OLX_DEBUG]', 'no session or urlLoc', '|', userAgent, '|', req.originalUrl);
                }
                return console.log('[OLX_DEBUG]', 'no session', '|', userAgent, '|', req.originalUrl);
            }
            bot = isBot(userAgent, platform, osName, osVersion);
            if (bot) {
                return statsd.increment([req.query.locNm, 'bot', bot, platform]);
            }
            trackerId = tracking.google.getId(siteLocation);
            if (trackerId) {
                if (req.rendrApp.session.get('internet.org')) {
                    host = host.replace('olx', 'olx-internet-org');
                }
                googleTracking(req, trackerId, host);
            }
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
            },
            post: {
                success: function(req, options) {
                    statsd.increment([req.query.location, 'posting', 'success', options.platform]);
                },
                error: function(req, options) {
                    statsd.increment([req.query.location, 'posting', req.query.error, options.platform]);
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

    function isBot(userAgent, platform, osName, osVersion) {
        if (/googlebot/i.test(userAgent)) {
            return 'google';
        }
        osName = osName && osName !== 'Others' ? osName.toLowerCase() : 'unknown';
        osVersion = osVersion ? String(osVersion).toLowerCase() : 'unknown';
        return isBotPlatform(platform, osName, osVersion);
    }

    function isBotPlatform(platform, osName, osVersion) {
        switch (platform) {
            case 'wap':
                return isBotWap(osName);
            case 'html4':
                return isBotHtml4(osName);
            default:
                return osName === 'unknown' && osVersion === 'unknown' ? 'others' : false;
        }
    }

    function isBotWap(osName, osVersion) {
        switch (osName) {
            case 'others':
                return osVersion === 'unknown' ? 'others' : false;
            case 'ios':
                return osVersion === '4' ? 'others' : false;
            case 'samsungproprietary':
            case 'bada':
                return 'others';
            default:
                return false;
        }
    }

    function isBotHtml4(osName, osVersion) {
        switch (osName) {
            case 'nokiaos':
                return osVersion === '0' ? 'others' : false;
            default:
                return false;
        }
    }

};
