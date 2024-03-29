'use strict';

module.exports = function trackingRouter(app, dataAdapter) {
    var _ = require('underscore');
    var qs = require('querystring');
    var restler = require('restler');
    var statsd  = require('../modules/statsd')();
    var Sixpack = require('../../shared/sixpack');
    var config = require('../../shared/config');
    var utils = require('../../shared/utils');
    var tracking = require('../../app/modules/tracking');
    var helpers = require('../../app/helpers');
    var env = config.get(['environment', 'type'], 'development');
    var gif = new Buffer('R0lGODlhAQABAPAAAP39/QAAACH5BAgAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');
    var devices = ['Android', 'iOS'];

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
                statsd.increment([req.query.locIso || 'all', 'tracking', type, tracker, platform, 'success']);
            })
            .on('fail', function fail(err) {
                statsd.increment([req.query.locIso || 'all', 'tracking', type, tracker, platform, 'fail']);
            })
            .on('error', function error() {
                statsd.increment([req.query.locIso || 'all', 'tracking', type, tracker, platform, 'error']);
            });
    }

    function checkSession(req, options) {
        if (!req.rendrApp.session.get('location')) {
            req.rendrApp.session.update({
                location: {
                    url: options.location
                }
            });
        }
        if (!req.rendrApp.session.get('platform')) {
            req.rendrApp.session.update({
                platform: options.platform
            });
        }
    }

    (function pageview() {
        app.get('/tracking/pageview.gif', handler);

        function graphiteTracking(req) {
            var platform = req.rendrApp.session.get('platform');
            var osName = req.rendrApp.session.get('osName');
            var hitCount = req.rendrApp.session.get('hitCount');
            var clientId = req.rendrApp.session.get('clientId');

            statsd.increment([req.query.locIso || 'all', 'pageview', _.contains(devices, osName) ? osName : 'others', platform]);
            if (!hitCount) {
                statsd.increment([req.query.locIso || 'all', 'sessions', platform, 'error']);
            }
            else {
                if (hitCount > 1) {
                    statsd.increment([req.query.locIso || 'all', 'sessions', platform, 'recurrent']);
                }
                else {
                    statsd.increment([req.query.locIso || 'all', 'sessions', platform, 'new']);
                }
            }
        }

        function analyticsTracking(ctx, host, page) {
            if (!ctx.req.query.page || !tracking.analytics.isServerEnabled.call(ctx)) {
                return;
            }
            var platform = ctx.app.session.get('platform') || utils.defaults.platform;
            var language = ctx.app.session.get('selectedLanguage');
            var location = ctx.app.session.get('location');
            var osName = ctx.app.session.get('osName') || 'unknown';
            var osVersion = ctx.app.session.get('osVersion') || 'unknown';
            var params = {
                host: host || ctx.req.host,
                page: page || ctx.req.query.page,
                referer: ctx.req.query.referer,
                ip: ctx.app.session.get('ip'),
                clientId: ctx.app.session.get('clientId'),
                hitCount: ctx.app.session.get('hitCount'),
                keyword: ctx.req.query.keyword
            };
            var config = {
                platform: platform,
                siteLocation: ctx.app.session.get('siteLocation') || ctx.req.query.locUrl
            };
            var url;

            if (language) {
                params.language = language.toLowerCase();
            }
            osName = osName.replace(/\s/g, '').toLowerCase();
            params.custom = ['8(olx_visitor_country)9(', platform, '_', osName, '_', osVersion, '_', ctx.req.query.locNm, ')11(1)'].join('');
            url = tracking.analytics.pageview.call(ctx, params, config);

            track(ctx.req, url, 'pageview', 'google');
        }

        function atiTracking(ctx) {
            if (!ctx.req.query.custom || !tracking.ati.isServerEnabled.call(ctx)) {
                return;
            }
            var location = ctx.app.session.get('location');
            var params = {
                clientId: ctx.app.session.get('clientId').substr(24),
                custom: ctx.req.query.custom,
                referer: ctx.req.query.referer
            };
            var config = {
                platform: ctx.app.session.get('platform'),
                location: (location ? location.url : '') || ctx.req.query.locUrl
            };
            var xtor = ctx.req.query.xtor;
            var url;

            if (xtor) {
                params.xtor = xtor;
            }
            url = tracking.ati.pageview.call(ctx, params, config);

            track(ctx.req, url, 'pageview', 'ati');
        }

        function atiTrackingColombia(ctx) {
            if (env !== 'production') {
                return;
            }
            if (!ctx.req.query.custom) {
                return;
            }
            var location = ctx.app.session.get('location');
            var params = {
                clientId: ctx.app.session.get('clientId').substr(24),
                custom: ctx.req.query.custom,
                referer: ctx.req.query.referer
            };
            var config = {
                platform: ctx.app.session.get('platform'),
                location: (location ? location.url : '') || ctx.req.query.locUrl,
                siteId: 539154,
                logServer: 'logw306'
            };
            var url = tracking.ati.pageview.call(ctx, params, config);

            track(ctx.req, url, 'pageview', 'ati');
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
                    return false;
                }
                return false;
            }
            bot = isBot(userAgent, platform, osName, osVersion);
            if (bot) {
                statsd.increment([req.query.locIso || 'all', 'bot', bot, platform]);
                return false;
            }
            if (req.query.custom) {
                try {
                    platformUrl = JSON.parse(req.query.custom).platform;
                }
                catch (err) {}
                if (platformUrl !== 'wap' && platformUrl !== 'html4' && platformUrl !== 'html5') {
                    return false;
                }
            }
            location = req.rendrApp.session.get('location');
            checkSession(req, {
                platform: platform,
                location: location ? location.url : req.query.locUrl
            });
            return true;
        }

        function handler(req, res) {
            var platform = req.rendrApp.session.get('platform') || utils.defaults.platform;
            var host = req.host;
            var page = req.query.page;
            var ctx = {
                req: req,
                app: req.rendrApp
            };

            res.on('finish', function onResponseFinish() {
                if (!check(req)) {
                    return;
                }

                graphiteTracking(req);
                if (req.rendrApp.session.get('internet.org')) {
                    host = host.replace('olx', 'olx-internet-org');
                    page = '/internet.org' + page;
                }
                analyticsTracking(ctx, host, page);
                if (req.query.locUrl !== 'www.olx.com.co') {
                    return atiTracking(ctx);
                }
                atiTrackingColombia(ctx);
            });

            res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-age=0, max-stale=0, post-check=0, pre-check=0');
            res.set('Content-Type', 'image/gif');
            res.set('Content-Length', gif.length);
            res.end(gif);
        }
    })();

    (function pageevent() {
        app.get('/tracking/event.gif', handler);

        function analyticsTracking(ctx, host) {
            if (!tracking.analytics.isServerEnabled.call(ctx, null, 'event')) {
                return;
            }
            var params = _.extend({
                host: host,
                ip: ctx.app.session.get('ip'),
                clientId: ctx.app.session.get('clientId')
            }, ctx.req.query);
            var config = {
                platform: ctx.app.session.get('platform'),
                siteLocation: ctx.app.session.get('siteLocation') || ctx.req.query.locUrl
            };
            var url = tracking.analytics.event.call(ctx, params, config);

            track(ctx.req, url, 'pageevent', 'google');
        }

        function atiTracking(ctx) {
            if (!tracking.ati.isServerEnabled.call(ctx, null, 'event')) {
                return;
            }
            var location = ctx.app.session.get('location');
            var params = {
                clientId: ctx.app.session.get('clientId').substr(24),
                custom: ctx.req.query.custom,
                url: utils.fullizeUrl(ctx.req.query.url, ctx.app)
            };
            var config = {
                platform: ctx.app.session.get('platform'),
                location: (location ? location.url : '') || ctx.req.query.locUrl
            };
            var url = tracking.ati.event.call(ctx, params, config);

            track(ctx.req, url, 'pageevent', 'ati');
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
                    return false;
                }
                return false;
            }
            bot = isBot(userAgent, platform, osName, osVersion);
            if (bot) {
                statsd.increment([req.query.locIso || 'all', 'bot', bot, platform]);
                return false;
            }
            location = req.rendrApp.session.get('location');
            checkSession(req, {
                platform: platform,
                location: location ? location.url : req.query.locUrl
            });
            return true;
        }

        function handler(req, res) {
            var host = req.host;
            var ctx = {
                req: req,
                app: req.rendrApp
            };

            res.on('finish', function onResponseFinish() {
                if (!check(req)) {
                    return;
                }
                if (req.rendrApp.session.get('internet.org')) {
                    host = host.replace('olx', 'olx-internet-org');
                }
                analyticsTracking(ctx, host);
                atiTracking(ctx);
            });

            res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-age=0, max-stale=0, post-check=0, pre-check=0');
            res.set('Content-Type', 'image/gif');
            res.set('Content-Length', gif.length);
            res.end(gif);
        }
    })();

    (function statsD() {
        app.get('/tracking/statsd.gif', handler);

        function handler(req, res) {
            var metric = req.param('metric');
            var value = req.param('value');

            res.on('finish', function onResponseFinish() {
                if (!metric) {
                    return;
                }
                statsd.increment(metric.split('.'), value);
            });

            res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-age=0, max-stale=0, post-check=0, pre-check=0');
            res.set('Content-Type', 'image/gif');
            res.set('Content-Length', gif.length);
            res.end(gif);
        }
    })();

    (function sixpackConvert() {
        app.get('/tracking/sixpack.gif', handler);
        app.get('/tracking/sixpack/convert.gif', handler);

        function handler(req, res) {
            res.on('finish', function onResponseFinish() {
                var experiment = req.param('experiment');
                var platform = req.param('platform');
                var market = req.param('market');

                if (!experiment || !platform || !market) {
                    return;
                }

                var sixpack = new Sixpack({
                    clientId: req.rendrApp.session.get('clientId'),
                    ip: req.rendrApp.session.get('ip'),
                    userAgent: utils.getUserAgent(req),
                    platform: platform,
                    market: market
                });

                sixpack.convert(sixpack.experiments[experiment], req.param('kpi'));
            });

            res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-age=0, max-stale=0, post-check=0, pre-check=0');
            res.set('Content-Type', 'image/gif');
            res.set('Content-Length', gif.length);
            res.end(gif);
        }
    })();

    (function sixpackParticipate() {
        app.get('/tracking/sixpack/participate', handler);

        function handler(req, res) {
            var experiment = req.param('experiment');
            var platform = req.param('platform');
            var market = req.param('market');
            var sixpack;
            
            if (!experiment || !platform || !market) {
                return response({});
            }
            sixpack = new Sixpack({
                clientId: req.rendrApp.session.get('clientId'),
                ip: req.rendrApp.session.get('ip'),
                userAgent: utils.getUserAgent(req),
                platform: platform,
                market: market
            });
            sixpack.participate(sixpack.experiments[experiment], function onComplete() {
                response(sixpack.experiments[experiment] || {});
            });

            function response(data) {
                res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                res.json(data);
            }
        }
    })();

    (function log() {
        app.get('/tracking/log.gif', handler);

        function handler(req, res) {
            res.on('finish', function onResponseFinish() {
                console.log(req.param('message'));
            });

            res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-age=0, max-stale=0, post-check=0, pre-check=0');
            res.set('Content-Type', 'image/gif');
            res.set('Content-Length', gif.length);
            res.end(gif);
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
