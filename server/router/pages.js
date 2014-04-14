'use strict';

var asynquence = require('asynquence');
var configServer = require('../../config');
var configClient = require('../../app/config');

module.exports = function itemRouter(app, dataAdapter) {
    app.get('/health', healthHandler);
    app.get('/check', checkHandler);
    app.get('/stats', statsHandler);

    function healthHandler(req, res) {
        res.json({
            online: true,
            message: 'Everything ok!'
        });
    }

    function checkHandler(req, res) {
        res.json({
            server: configServer.get(),
            client: configClient.get()
        });
    }

    function statsHandler(req, res) {
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

};
