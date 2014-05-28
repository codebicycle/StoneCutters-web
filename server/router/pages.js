'use strict';

module.exports = function itemRouter(app, dataAdapter) {
    var _ = require('underscore');
    var asynquence = require('asynquence');
    var formidable = require('../formidable');
    var configServer = require('../config');
    var configClient = require('../../app/config');
    var graphite = require('../graphite')();
    var Analytic = require('analytic');
    var utils = require('../utils');

    (function health() {
        app.get('/health', handler);

        function handler(req, res) {
            res.json({
                online: true,
                message: 'Everything ok!'
            });
        }
    })();

    (function check() {
        app.get('/check', handler);

        function handler(req, res) {
            res.json({
                server: configServer.get(),
                client: configClient.get()
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
            res.send(list.join(' '));
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

            res.send(list.join(' '));
        }
    })();

    (function statsThreads() {
        app.get('/stats/threads', handler);

        function handler(req, res) {
            res.send('threadCount:' + require('os').cpus().length);
        }
    })();

    (function pageview() {
        app.get('/pageview.gif', handler);

        function graphiteTracking(req) {
            var location = req.rendrApp.getSession('location');

            graphite.send([location.name, req.query.platform], 1, '+');
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
            var location = req.rendrApp.getSession('location');
            var atiConfig = configClient.get(['analytics', 'ati', location.id]);
            var analytic;

            if (atiConfig) {
                analytic = new Analytic('ati', {
                    id: atiConfig.siteId,
                    host: atiConfig.logServer,
                    clientId: req.rendrApp.getSession('clientId').substr(24)
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

            graphiteTracking(req);
            if (configServer.get(['analytics', 'google', 'enabled'], true)) {
                googleTracking(req);
            }
            if (configServer.get(['analytics', 'atinternet', 'enabled'], true)) {
                atiTracking(req);
            }

            image = new Buffer(image, 'base64');
            res.set('Content-Type', 'image/gif');
            res.set('Content-Length', image.length);
            res.send(image);
        }
    })();

    (function pageevent() {
        app.get('/pageevent.gif', handler);

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
            var location = req.rendrApp.getSession('location');
            var atiConfig = configClient.get(['analytics', 'ati', location.id]);
            var analytic;

            if (atiConfig) {
                analytic = new Analytic('ati-event', {
                    id: atiConfig.siteId,
                    host: atiConfig.logServer,
                    clientId: req.rendrApp.getSession('clientId').substr(24)
                });
                analytic.trackPage({
                    custom: req.query.custom,   
                    url: req.query.url   
                });
            }
        }

        function handler(req, res) {
            var image = 'R0lGODlhAQABAPAAAP39/QAAACH5BAgAAAAALAAAAAABAAEAAAICRAEAOw==';

            if (configServer.get(['analytics', 'google', 'enabled'], true)) {
                googleTracking(req);
            }
            if (configServer.get(['analytics', 'atinternet', 'enabled'], true)) {
                atiTracking(req);
            }
        
            image = new Buffer(image, 'base64');
            res.set('Content-Type', 'image/gif');
            res.set('Content-Length', image.length);
            res.send(image);
        }
    })();

    (function notFound() {
        app.get('*', handler);

        function handler(req, res) {
            res.redirect(utils.link('/404', req.rendrApp.getSession('siteLocation')));
        }
    })();
};
