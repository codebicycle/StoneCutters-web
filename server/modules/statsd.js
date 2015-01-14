'use strict';

var config = require('../config').get('statsD', {
    client: {
        host: 'graphite-server',
        port: 8125,
        cacheDns: true,
        prefix: 'application.webapp.'
    }
});
var hostname = require('os').hostname();
var StatsD = require('node-statsd').StatsD;
var logger = require('../../shared/logger')('statsD');
var client;

var Client = function(options) {
    var statsD = new StatsD(config.client);

    function increment(metric, value) {
        if (!metric) {
            return;
        }
        if (Array.isArray(metric)) {
            metric = metric.join('.');
        }
        metric = metric.toLowerCase();
        logger.log('Incrementing metric: ' + metric + ' by ' + (value || 1));
        statsD.increment(metric, value);
    }

    function gauge(metric, value) {
        if (!metric) {
            return;
        }
        if (Array.isArray(metric)) {
            metric = metric.join('.');
        }
        metric = metric.toLowerCase();
        logger.log('Gauging metric: ' + metric + ' by ' + (value || 1));
        statsD.gauge(metric, value);
    }

    return {
        increment: increment,
        gauge: gauge
    };
};

module.exports = function() {
    if (config.enabled) {
        if (!client) {
            logger.log('Creating new StatsD client');
            config.client.prefix += hostname + '.';
            client = new Client(config.client);
        }
    }
    else {
        client = {
            increment: function(metric, value) {},
            gauge: function(metric, value) {}
        };
    }
    return client;
};
