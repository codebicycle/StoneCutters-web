'use strict';

module.exports = function() {
    var graphite = require('graphite');
    var client = graphite.createClient('plaintext://graphite-server:2003/');
    var logger = require('./logger')('graphite');
    var metrics = {};

    metrics['olx-' + process.env + '.application.arwen.random'] = new Date().getTime();
    client.write(metrics, function(err) {
        if (err) {
            logger.error('%s', err);
        }
    });
};
