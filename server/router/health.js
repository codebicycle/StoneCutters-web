'use strict';

var asynquence = require('asynquence');

module.exports = function itemRouter(app, dataAdapter) {
    app.get('/health', healthHandler);

    function healthHandler(req, res) {
        res.json({
            online: true,
            message: 'Everything ok!'
        });
    }

};
