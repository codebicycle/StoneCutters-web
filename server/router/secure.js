'use strict';

module.exports = function itemRouter(app, dataAdapter) {
    var _ = require('underscore');
    var restler = require('restler');
    var utils = require('../../shared/utils');

    (function recaptcha() {
        app.get('/secure/recaptcha', handler);

        function handler(req, res) {
            var response = req.param('response');
            var remoteIp = req.param('remoteip');

            restler.get('https://www.google.com/recaptcha/api/siteverify?secret=6LcjQf8SAAAAADIPSryjN9TVSsgIrVSPADI-nC2a&response='+response+'&remoteip='+remoteIp)
            .on('success', function(data, response) {
                res.json(data);
            })
            .on('error', function(err, response) {
                res.json(err);
            });
        }
    })();
};
