'use strict';

var _ = require('underscore');

module.exports = function(options) {
    if (typeof window === 'undefined') {
        var statsdModule = '../server/modules/statsd';

        return require(statsdModule)(options);
    }
    return {
        increment: increment,
        gauge: gauge
    };
};

function increment(metric, value, options) {
    var url = '/tracking/statsd.gif';

    if (Array.isArray(metric)) {
        metric = metric.join('.');
    }
    if (_.isObject(value)) {
        options = value;
        value = undefined;
    }
    url += '?metric=' + metric;
    if (value !== undefined) {
        url += '&value=' + value;
    }
    $.ajax(_.extend({
        url: url,
        cache: false
    }, options || {}));
}

function gauge() {}
