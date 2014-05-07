'use strict';

module.exports = function itemRouter(app, dataAdapter) {
    var asynquence = require('asynquence');
    var configServer = require('../config');
    var configClient = require('../../app/config');

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

    (function notFound() {
        app.get('*', handler);

        function handler(req, res) {
            res.redirect('/404');
        }
    })();
};
