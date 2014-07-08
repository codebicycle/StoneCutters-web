'use strict';

module.exports = function itemRouter(app, dataAdapter) {
    var _ = require('underscore');
    var asynquence = require('asynquence');
    var configServer = require('../config');
    var configClient = require('../../app/config');
    var configAnalytics = require('../../app/analytics/config');
    var utils = require('../../shared/utils');
    var graphite = require('../graphite')();
    var Analytic = require('analytic');
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

    (function pageview() {
        app.get('/analytics/pageview.gif', handler);

        function graphiteTracking(req) {
            graphite.send([req.query.locNm, 'pageview', req.query.platform], 1, '+');
            graphite.send([req.query.locNm, 'devices', req.query.osNm || 'Others', req.query.platform], 1, '+');
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
                ip: ip
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

            graphiteTracking(req);
            if (configServer.get(['analytics', 'google', 'enabled'], true)) {
                googleTracking(req);
            }
            if (configServer.get(['analytics', 'atinternet', 'enabled'], true)) {
                atiTracking(req);
            }
        }
    })();

    (function pageevent() {
        app.get('/analytics/pageevent.gif', handler);

        function googleTracking(req) {
            var analytic = new Analytic('google-event', {
                host: req.host
            });
            var ip = req.ip;

            if (req.header('HTTP_X_PROXY_X_NETLI_FORWARDED_FOR')) {
                ip = req.header('HTTP_X_PROXY_X_NETLI_FORWARDED_FOR');
            }
            analytic.trackPage(_.extend({
                ip: ip
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

            if (configServer.get(['analytics', 'google', 'enabled'], true)) {
                googleTracking(req);
            }
            if (configServer.get(['analytics', 'atinternet', 'enabled'], true)) {
                atiTracking(req);
            }
        }
    })();
};
