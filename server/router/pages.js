'use strict';

module.exports = function itemRouter(app, dataAdapter) {
    var _ = require('underscore');
    var asynquence = require('asynquence');
    var configServer = require('../config');
    var configClient = require('../../app/config');
    var configAnalytics = require('../../app/analytics/config');
    var Session = require('../../shared/session');
    var utils = require('../../shared/utils');
    var graphite = require('../graphite')();
    var Analytic = require('../analytic');
    var http = require('http');
    var https = require('https');

    (function health() {
        app.get('/health', handler);

        function handler(req, res) {
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.json({
                online: true,
                message: 'Everything ok!'
            });
        }
    })();

    (function stats() {
        app.get('/stats', handler);

        function handler(req, res) {
            var list = [];

            list.push('environment.platform:' + process.platform);
            list.push('environment.architecture:' + process.arch);
            list.push('process.pid:' + process.pid);
            list.push('process.title:' + process.title);
            list.push('node.version:' + process.versions.node);
            list.push('node.uptime:' + process.uptime());
            list.push('memory.rss:' + process.memoryUsage().rss);
            list.push('memory.heapTotal:' + process.memoryUsage().heapTotal);
            list.push('memory.heapUsed:' + process.memoryUsage().heapUsed);
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.send(list.join(' '));
        }
    })();

    (function check() {
        app.get('/stats/check', handler);

        function handler(req, res) {
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.json({
                server: configServer.get(),
                client: configClient.get()
            });
        }
    })();

    (function statsMemory() {
        app.get('/stats/memory', handler);

        function handler(req, res) {
            var list = [];
            var freeMemory = process.memoryUsage().heapTotal - process.memoryUsage().heapUsed;
            var usableFreeMemory = process.memoryUsage().rss - process.memoryUsage().heapTotal + freeMemory;
            var usedPercent = (process.memoryUsage().heapTotal - freeMemory) / process.memoryUsage().rss;

            list.push('freeMemory:' + freeMemory);
            list.push('maxMemory:' + process.memoryUsage().rss);
            list.push('totalMemory:' + process.memoryUsage().heapTotal);
            list.push('usableFreeMemory:' + usableFreeMemory);
            list.push('usedPercent:' + usedPercent);

            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.send(list.join(' '));
        }
    })();

    (function statsThreads() {
        app.get('/stats/threads', handler);

        function handler(req, res) {
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.send('threadCount:' + require('os').cpus().length);
        }
    })();

    (function statsHeaders() {
        app.get('/stats/headers', handler);

        function handler(req, res) {
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.json({
                headers: req.headers
            });
        }
    })();

    (function statsHeaders() {
        app.get('/stats/sockets', handler);

        function handler(req, res) {
            var stats = {
                http: {
                    sockets: {
                        max: http.globalAgent.maxSockets,
                        inUse: {
                            total: 0
                        },
                        free: http.globalAgent.maxSockets
                    },
                    queue: {}
                },
                https: {
                    sockets: {
                        max: https.globalAgent.maxSockets,
                        inUse: {
                            total: 0
                        },
                        free: http.globalAgent.maxSockets
                    },
                    queue: {}
                }
            };
            var url;

            for (url in http.globalAgent.sockets) {
                stats.http.sockets.inUse[url] = http.globalAgent.sockets[url].length;
                stats.http.sockets.free = http.globalAgent.maxSockets - http.globalAgent.sockets[url].length;
                stats.http.sockets.inUse.total += http.globalAgent.sockets[url].length;
            }
            for (url in http.globalAgent.requests) {
                stats.http.queue[url] = http.globalAgent.requests[url].length;
            }
            for (url in https.globalAgent.sockets) {
                stats.https.sockets.inUse[url] = https.globalAgent.sockets[url].length;
                stats.https.sockets.free = https.globalAgent.maxSockets - https.globalAgent.sockets[url].length;
                stats.https.sockets.inUse.total += https.globalAgent.sockets[url].length;
            }
            for (url in https.globalAgent.requests) {
                stats.https.queue[url] = https.globalAgent.requests[url].length;
            }
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.json(stats);
        }
    })();

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
        utmcc.push('; __utmz=');
        utmcc.push(gaDh);
        utmcc.push('.');
        utmcc.push(gaCs);
        utmcc.push('.');
        utmcc.push(gaNs);
        utmcc.push('.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none);');
        return utmcc.join('');
    }

    (function pageview() {
        app.get('/analytics/pageview.gif', handler);

        function graphiteTracking(req) {
            graphite.send([req.query.locNm, 'pageview', req.query.platform], 1, '+');
            graphite.send([req.query.locNm, 'devices', req.query.osNm, req.query.platform], 1, '+');
        }

        function googleTracking(req) {
            var analytic = new Analytic('google', {
                id: req.query.id,
                host: req.host
            });
            var ip = req.ip;

            if (req.header('HTTP_X_PROXY_X_NETLI_FORWARDED_FOR')) {
                ip = req.header('HTTP_X_PROXY_X_NETLI_FORWARDED_FOR');
            }
            analytic.trackPage({
                page: req.query.page,
                referer: req.query.referer,
                ip: ip,
                dynamics: {
                    utmcc: googleUTMCC(req)
                }
            });
        }

        function atiTracking(req) {
            var env = configClient.get(['environment', 'type'], 'development');
            var countryId = req.query.locId;
            var atiConfig;
            var analytic;

            if (env !== 'production') {
                countryId = 0;
            }
            atiConfig = utils.get(configAnalytics, ['ati', 'paths', countryId]);
            if (atiConfig) {
                analytic = new Analytic('ati', {
                    id: atiConfig.siteId,
                    host: atiConfig.logServer,
                    clientId: req.query.cliId
                });
                analytic.trackPage({
                    page: req.query.page,
                    referer: req.query.referer,
                    custom: req.query.custom
                });
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
                host: req.host,
                userId: req.query.cliId
            });
            var ip = req.ip;

            if (req.header('HTTP_X_PROXY_X_NETLI_FORWARDED_FOR')) {
                ip = req.header('HTTP_X_PROXY_X_NETLI_FORWARDED_FOR');
            }
            analytic.trackPage(_.extend({
                ip: ip,
                dynamics: {
                    utmcc: googleUTMCC(req)
                }
            }, req.query));
        }

        function atiTracking(req) {
            var env = configClient.get(['environment', 'type'], 'development');
            var countryId = req.query.locId;
            var atiConfig;
            var analytic;

            if (env !== 'production') {
                countryId = 0;
            }
            atiConfig = utils.get(configAnalytics, ['ati', 'paths', countryId]);
            if (atiConfig) {
                analytic = new Analytic('ati-event', {
                    id: atiConfig.siteId,
                    host: atiConfig.logServer,
                    clientId: req.query.cliId
                });
                analytic.trackPage({
                    custom: req.query.custom,
                    url: req.query.url
                });
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

    (function force() {
        app.get('/force/:platform?', handler);

        function handler(req, res) {
            Session.call(req.rendrApp, false, {
                isServer: true
            }, callback);

            function callback() {
                var forcedPlatform = req.rendrApp.session.get('forcedPlatform');
                var platform = req.param('platform');

                if (!platform && (forcedPlatform && forcedPlatform === platform) || !_.contains(configServer.get('platforms', []), platform)) {
                    req.rendrApp.session.clear('forcedPlatform');
                }
                else {
                    req.rendrApp.session.persist({
                        forcedPlatform: platform
                    });
                }
                res.redirect(utils.link('/', req.rendrApp));
            }
        }
    })();

    (function analytics() {
        app.get('/analytics', handler);

        function handler(req, res) {
            var analytic = new Analytic('google', {
                id: 'MO-50756825-1',
                host: req.host
            });
            var ip = req.ip;

            if (req.header('HTTP_X_PROXY_X_NETLI_FORWARDED_FOR')) {
                ip = req.header('HTTP_X_PROXY_X_NETLI_FORWARDED_FOR');
            }
            var analytics = {
                url: analytic.trackPage({
                    page: 'test',
                    referer: '-',
                    ip: ip,
                    dynamics: {
                        utmcc: googleUTMCC(req)
                    }
                })
            };

            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.json(analytics);
        }
    })();
};
