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

    (function force() {
        app.get('/force/:platform?', handler);

        function handler(req, res) {
            var platform = req.param('platform', null);
            var platforms = configClient.get('platforms',  ['wap', 'html4', 'html5', 'desktop']);

            if (platform && ~platforms.indexOf(platform)) {
                req.rendrApp.updateSession({
                    platformForced: true,
                    platform: platform
                });
            }
            else {
                req.rendrApp.updateSession({
                    platformForced: false
                });
            }
            res.redirect('/');
        }
    })();
};
