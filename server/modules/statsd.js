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
        statsD.increment(metric, value);
    }

    function gauge(metric, value) {
        if (!(metric = stringify(metric))) {
            return;
        }
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
    if (~metric.indexOf('dgd.')) {
        console.log('SERVER', metric, (~metric.indexOf('search.refine.') ? new Error().stack : ''));
    }
    return metric;
}
