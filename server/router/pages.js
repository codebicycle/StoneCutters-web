'use strict';

var asynquence = require('asynquence');
var configServer = require('../../config');
var configClient = require('../../app/config');

module.exports = function itemRouter(app, dataAdapter) {

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

    (function force() {
        app.get('/force/:platform?', handler);

        function handler(req, res) {
            var _ = require('underscore');
            var platform = req.param('platform', '');
            var platforms = configClient.get('platforms',  ['wap', 'html4', 'html5', 'desktop']);
            if (platform && _.indexOf(platforms, platform) < 0) {
                platform = '';
            }
            if (req.cookies) {
                res.cookie('platform', platform, {maxAge: 3600000});
            }
            res.redirect('/');
        }
    })();
};
