'use strict';

var _ = require('underscore');
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

var PLACEHOLDER = '<<separator>>';
var SEPARATOR = '.';
var SPACE = '_';
var DOT = '+';

var rSeparator = new RegExp(PLACEHOLDER, 'g');
var rSpace = / /g;
var rDot = /\./g;

var Client = function(options) {
    var statsD = new StatsD(config.client);

    function increment(metric, value, options) {
        if (!(metric = stringify(metric))) {
            return;
        }
        if (_.isObject(value)) {
            value = undefined;
        }
        statsD.increment(metric, value, undefined, log.bind(null, metric));
    }

    function gauge(metric, value) {
        if (!(metric = stringify(metric))) {
            return;
        }
        statsD.gauge(metric, value);
    }

    function log(metric, err) {
        if (err) {
            try {
                console.log('[OLX_DEBUG]', 'Graphite not found |', metric, err instanceof Error ? JSON.stringify(err.stack) : err);
            } catch (e) {
                // Ignore
            }
        }
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
            client = new Client(config.client);
        }
    }
    else {
        client = {
            increment: stringify,
            gauge: stringify
        };
    }
    return client;
};

function stringify(metric, value) {
    if (!metric) {
        return;
    }
    if (Array.isArray(metric)) {
        metric = metric.join(PLACEHOLDER);
    }
    metric = metric.toLowerCase().replace(rSpace, SPACE).replace(rDot, DOT).replace(rSeparator, SEPARATOR);
    if (config.enabled || config.debug) {
        logger.log(metric + ': ' + (value || 1));
    }
    console.log(metric);
    return metric;
}
