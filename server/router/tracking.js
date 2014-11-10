'use strict';

module.exports = function trackingRouter(app, dataAdapter) {
    var _ = require('underscore');
    var restler = require('restler');
    var statsd  = require('../modules/statsd')();
    var config = require('../../shared/config');
    var utils = require('../../shared/utils');
    var tracking = require('../../app/modules/tracking');
    var env = config.get(['environment', 'type'], 'development');
    var image = 'R0lGODlhAQABAPAAAP39/QAAACH5BAgAAAAALAAAAAABAAEAAAICRAEAOw==';

    function prepare(options, params) {
        options = _.defaults(options, {
            method: 'get',
            query: params
        });

        if (options.method === 'post') {
            options.data = options.query;
            delete options.query;
        }
        return options;
    }

    function getOption(options, name) {
        var value = options[name];

        delete options[name];
        return value;
    }

    function track(req, url, type, tracker) {
        if (!url) {
            return;
        }
        var platform = req.rendrApp.session.get('platform');
        var options = {
            headers: {
                'User-Agent': utils.getUserAgent(req),
                'Accept-Encoding': 'gzip,deflate,sdch',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        };

        restler.request(url, options)
            .on('success', function success() {
                statsd.increment([req.query.locNm, 'tracking', type, tracker, platform, 'success']);
            })
            .on('fail', function error() {
                statsd.increment([req.query.locNm, 'tracking', type, tracker, platform, 'error']);
            })
            .on('error', function fail() {
                statsd.increment([req.query.locNm, 'tracking', type, tracker, platform, 'fail']);
            });
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

        function analyticsTracking(req, host, page) {
            if (!req.query.page) {
                return;
            }
            var platform = req.rendrApp.session.get('platform') || utils.defaults.platform;
            var language = req.rendrApp.session.get('selectedLanguage');
            var location = req.rendrApp.session.get('location');
            var osName = req.rendrApp.session.get('osName') || 'unknown';
            var osVersion = req.rendrApp.session.get('osVersion') || 'unknown';
            var params = {
                host: host || req.host,
                page: page || req.query.page,
                referer: req.query.referer,
                ip: req.rendrApp.session.get('ip'),
                clientId: req.rendrApp.session.get('clientId'),
                hitCount: req.rendrApp.session.get('hitCount'),
                keyword: req.query.keyword
            };
            var config = {
                platform: platform,
                siteLocation: req.rendrApp.session.get('siteLocation') || req.query.locUrl
            };
            var url;

            if (language) {
                params.language = language.toLowerCase();
            }
            osName = osName.replace(/\s/g, '').toLowerCase();
            params.custom = ['8(olx_visitor_country)9(', platform, '_', osName, '_', osVersion, '_', req.query.locNm, ')11(1)'].join('');
            url = tracking.analytics.pageview.call({
                app: req.rendrApp
            }, params, config);

            track(req, url, 'pageview', 'google');
        }

        function atiTracking(req) {
            if (!req.query.custom) {
                return;
            }
            var location = req.rendrApp.session.get('location');
            var params = {
                clientId: req.rendrApp.session.get('clientId').substr(24),
                custom: req.query.custom,
                referer: req.query.referer
            };
            var config = {
                platform: req.rendrApp.session.get('platform'),
                location: (location ? location.url : false) || req.query.locUrl
            };
            var url = tracking.ati.pageview.call({
                app: req.rendrApp
            }, params, config);

            track(req, url, 'pageview', 'ati');
        }

        function atiTrackingColombia(req) {
            if (env !== 'production') {
                return;
            }
            if (!req.query.custom) {
                return;
            }
            var location = req.rendrApp.session.get('location');
            var params = {
                clientId: req.rendrApp.session.get('clientId').substr(24),
                custom: req.query.custom,
                referer: req.query.referer
            };
            var config = {
                platform: req.rendrApp.session.get('platform'),
                location: (location ? location.url : false) || req.query.locUrl,
                siteId: 539154,
                logServer: 'logw306'
            };
            var url = tracking.ati.pageview.call({
                app: req.rendrApp
            }, params, config);

            track(req, url, 'pageview', 'ati');
        }

        function check(req) {
            var location = req.rendrApp.session.get('siteLocation');
            var siteLocation = location || req.query.locUrl;
            var platform = req.rendrApp.session.get('platform') || utils.defaults.platform;
            var osName = req.rendrApp.session.get('osName');
            var osVersion = req.rendrApp.session.get('osVersion');
            var userAgent = utils.getUserAgent(req);
            var platformUrl;
            var bot;

            if (!location) {
                if (!siteLocation) {
                    /* console.log('[OLX_DEBUG]', 'no session or urlLoc', '|', userAgent, '|', req.originalUrl); */
                    return false;
                }
                /* console.log('[OLX_DEBUG]', 'no session', '|', userAgent, '|', req.originalUrl); */
                return false;
            }
            bot = isBot(userAgent, platform, osName, osVersion);
            if (bot) {
                statsd.increment([req.query.locNm, 'bot', bot, platform]);
                return false;
            }
            try {
                platformUrl = JSON.parse(req.query.custom).platform;
            }
            catch (err) {}
            if (platformUrl !== 'wap' && platformUrl !== 'html4' && platformUrl !== 'html5') {
                /* console.log('[OLX_DEBUG]', 'ati', platform, platformUrl, userAgent, host, req.originalUrl); */
                return false;
            }
            return true;
        }

        function handler(req, res) {
            var gif = new Buffer(image, 'base64');
            var platform = req.rendrApp.session.get('platform') || utils.defaults.platform;
            var host = req.host;
            var page = req.query.page;

            res.set('Content-Type', 'image/gif');
            res.set('Content-Length', gif.length);
            res.end(gif);

            if (!check(req)) {
                return;
            }

            graphiteTracking(req);
            if (req.rendrApp.session.get('internet.org')) {
                host = host.replace('olx', 'olx-internet-org');
                page = '/internet.org' + page;
            }
            analyticsTracking(req, host, page);
            if (req.query.locUrl === 'www.olx.com.br' && platform !== 'wap') {
                return;
            }
            if (req.query.locUrl !== 'www.olx.com.co') {
                return atiTracking(req);
            }
            atiTrackingColombia(req);
        }
    })();

    (function pageevent() {
        app.get('/analytics/pageevent.gif', handler);

        function analyticsTracking(req, host) {
            if (!req.query.page) {
                return;
            }
            var params = _.extend({
                host: host,
                ip: req.rendrApp.session.get('ip'),
                clientId: req.rendrApp.session.get('clientId')
            }, req.query);
            var config = {
                platform: req.rendrApp.session.get('platform'),
                siteLocation: req.rendrApp.session.get('siteLocation') || req.query.locUrl
            };
            var url = tracking.analytics.event.call({
                app: req.rendrApp
            }, params, config);

            track(req, url, 'pageevent', 'google');
        }

        function atiTracking(req) {
            if (!req.query.custom) {
                return;
            }
            var location = req.rendrApp.session.get('location');
            var params = {
                clientId: req.rendrApp.session.get('clientId').substr(24),
                custom: req.query.custom,
                url: req.query.url
            };
            var config = {
                platform: req.rendrApp.session.get('platform'),
                location: (location ? location.url : false) || req.query.locUrl
            };
            var url = tracking.ati.event.call({
                app: req.rendrApp
            }, params, config);

            track(req, url, 'pageevent', 'ati');
        }

        function check(req) {
            var location = req.rendrApp.session.get('siteLocation');
            var siteLocation = location || req.query.locUrl;
            var platform = req.rendrApp.session.get('platform') || utils.defaults.platform;
            var osName = req.rendrApp.session.get('osName');
            var osVersion = req.rendrApp.session.get('osVersion');
            var userAgent = utils.getUserAgent(req);
            var bot;

            if (!location) {
                if (!siteLocation) {
                    /* console.log('[OLX_DEBUG]', 'no session or urlLoc', '|', userAgent, '|', req.originalUrl); */
                    return false;
                }
                /* console.log('[OLX_DEBUG]', 'no session', '|', userAgent, '|', req.originalUrl); */
                return false;
            }
            bot = isBot(userAgent, platform, osName, osVersion);
            if (bot) {
                statsd.increment([req.query.locNm, 'bot', bot, platform]);
                return false;
            }
            return true;
        }

        function handler(req, res) {
            var gif = new Buffer(image, 'base64');
            var host = req.host;

            res.set('Content-Type', 'image/gif');
            res.set('Content-Length', gif.length);
            res.end(gif);

            if (!check(req)) {
                return;
            }
            if (req.rendrApp.session.get('internet.org')) {
                host = host.replace('olx', 'olx-internet-org');
            }
            analyticsTracking(req, host);
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
