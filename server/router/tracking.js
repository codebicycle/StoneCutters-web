'use strict';

module.exports = function itemRouter(app, dataAdapter) {
    var _ = require('underscore');
    var uuid = require('node-uuid');
    var crypto = require('crypto');
    var configServer = require('../config');
    var configClient = require('../../app/config');
    var configAnalytics = require('../../app/analytics/config');
    var Session = require('../../shared/session');
    var utils = require('../../shared/utils');
    var graphite = require('../graphite')();
    var Analytic = require('../analytic');

    function defaultOptions(req) {
        return {
            headers: { 
                'User-Agent': (req.get('user-agent') || utils.defaults.userAgent)
            }
        };
    }

    function googleIp(req) {
        var ip = req.header('HTTP_X_PROXY_X_NETLI_FORWARDED_FOR');

        if (!ip) {
            ip = req.ip;
        }
        return ip;
    }
    
    function googleUTMCC(req) {
        var utmcc = [];
        var gaDh = req.rendrApp.session.get('gaDh');
        var gaCs = req.rendrApp.session.get('gaCs');
        var gaNs = req.rendrApp.session.get('gaNs');

        utmcc.push('__utma=');
        utmcc.push(gaDh);
        utmcc.push('.');
        utmcc.push(req.rendrApp.session.get('gaUid'));
        utmcc.push('.');
        utmcc.push(req.rendrApp.session.get('gaIs'));
        utmcc.push('.');
        utmcc.push(req.rendrApp.session.get('gaPs'));
        utmcc.push('.');
        utmcc.push(gaCs);
        utmcc.push('.');
        utmcc.push(gaNs);
        utmcc.push(';');
        return utmcc.join('');
    }

    (function analytics() {
        app.get('/analytics', handler);

        function handler(req, res) {
            var analytic = new Analytic('google', {
                id: 'MO-50756825-1',
                host: req.host
            });
            var ip = googleIp(req);
            var options = defaultOptions(req);
            var url = analytic.track({
                page: 'test',
                referer: '-',
                ip: ip,
                dynamics: {
                    utmcc: googleUTMCC(req),
                    utmvid: req.rendrApp.session.get('visitorId')
                }
            }, options);

            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.json({
                url: url
            });
        }
    })();

    (function pageview() {
        app.get('/analytics/pageview.gif', handler);

        function graphiteTracking(req) {
            graphite.send([req.query.locNm, 'pageview', req.query.platform], 1, '+');
            graphite.send([req.query.locNm, 'devices', req.query.osNm, req.query.platform], 1, '+');
        }

        function googleTracking(req) {
            var analytic = new Analytic('google', {
                id: req.query.id,
                host: req.host,
                clientId: req.rendrApp.session.get('visitorId')
            });
            var ip = googleIp(req);
            var options = defaultOptions(req);

            analytic.track({
                page: req.query.page,
                referer: req.query.referer,
                ip: ip
            }, options);
        }

        function atiTracking(req) {
            var env = configClient.get(['environment', 'type'], 'development');
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
                analytic = new Analytic('ati', {
                    id: atiConfig.siteId,
                    host: atiConfig.logServer,
                    clientId: req.query.cliId
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
                if (configServer.get(['analytics', 'google', 'enabled'], true)) {
                    googleTracking(req);
                }
                if (configServer.get(['analytics', 'atinternet', 'enabled'], true)) {
                    atiTracking(req);
                }
            }
        }
    })();

    (function pageevent() {
        app.get('/analytics/pageevent.gif', handler);

        function googleTracking(req) {
            var analytic = new Analytic('google-event', {
                id: req.query.id,
                host: req.host,
                clientId: req.rendrApp.session.get('visitorId')
            });
            var ip = googleIp(req);
            var options = defaultOptions(req);

            analytic.track(_.extend({
                ip: ip
            }, req.query), options);
        }

        function atiTracking(req) {
            var env = configClient.get(['environment', 'type'], 'development');
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
                analytic = new Analytic('ati-event', {
                    id: atiConfig.siteId,
                    host: atiConfig.logServer,
                    clientId: req.query.cliId
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
                if (configServer.get(['analytics', 'google', 'enabled'], true)) {
                    googleTracking(req);
                }
                if (configServer.get(['analytics', 'atinternet', 'enabled'], true)) {
                    atiTracking(req);
                }
            }
        }
    })();

    (function graphiteGif() {
        app.get('/analytics/graphite.gif', handler);

        var metrics = {
            reply: {
                success: function(req) {
                    graphite.send([req.query.location, 'reply', 'success', req.query.platform], 1, '+');
                },
                error: function(req) {
                    graphite.send([req.query.location, 'reply', 'error', req.query.platform], 1, '+');
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