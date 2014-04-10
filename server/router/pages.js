'use strict';

var asynquence = require('asynquence');
var configServer = require('../../config');
var configClient = require('../../app/config');

module.exports = function itemRouter(app, dataAdapter) {
    app.get('/health', healthHandler);
    app.get('/check', checkHandler);

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

};
