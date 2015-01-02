'use strict';

module.exports = function itemRouter(app, dataAdapter) {
    var _ = require('underscore');
    var restler = require('restler');
    var utils = require('../../shared/utils');
    var config = require('../../shared/config');

    (function recaptcha() {
        app.get('/secure/recaptcha', handler);

        function handler(req, res) {
            var secretKey = config.get(['recaptcha', 'secretKey']);
            var response = req.param('response');
            var remoteIp = req.param('remoteip');

            restler.get('https://www.google.com/recaptcha/api/siteverify?secret='+secretKey+'&response='+response+'&remoteip='+remoteIp)
            .on('success', function(data, response) {
                res.json(data);
            })
            .on('error', function(err, response) {
                res.json(err);
            });
        }
    })();
};
