'use strict';

module.exports = function pagesRouter(app, dataAdapter) {
    var _ = require('underscore');
    var configServer = require('../config');
    var configClient = require('../../shared/config');
    var Session = require('../../shared/session');
    var utils = require('../../shared/utils');
    var http = require('http');
    var https = require('https');
    var json2html = require('node-json2html');
    var transform = {
        tag: 'li',
        html: '<strong>${key}:</strong> ${value}'
    };

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

    (function statsHeadersHtml() {
        app.get('/stats/headers.html', handler);

        function handler(req, res) {
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.send('<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" /></head><body><ul>' + json2html.transform(Object.keys(req.headers).map(function each(key) {
                return {
                    key: key,
                    value: req.headers[key]
                };
            }), transform) + '</ul></body></html>');
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
                        forcedPlatform: platform,
                        originalPlatform: req.subdomains.pop()
                    });
                }
                res.redirect(utils.link('/', req.rendrApp));
            }
        }
    })();
};
