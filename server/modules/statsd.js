'use strict';

var config = require('../config').get('statsD', {
    client: {
        host: 'graphite-server',
        port: 8125,
        cacheDns: true,
        prefix: 'application.mobile.webapp.'
    }
});
var StatsD = require('node-statsd').StatsD;
var logger = require('../../shared/logger')('statsD');
var client;

var Client = function(options) {
    var statsD = new StatsD(config.client);

    function increment(metric, value) {
        if (Array.isArray(metric)) {
            metric = metric.join('.');
        }
        logger.log('Incrementing metric: ' + metric + ' by ' + (value || 1));
        statsD.increment(metric, value);
    }

    return {
        increment: increment
    };
};

module.exports = function() {
    if (config.enabled) {
        if (!client) {
            logger.log('Creating new StatsD client');
            client = new Client(config.client);
        }
    }
    else {
        client = {
            increment: function() {}
        };
    }
    return client;
};
