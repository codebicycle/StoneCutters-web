'use strict';

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

function increment(metric, value) {
    var url = '/tracking/statsd.gif';

    if (Array.isArray(metric)) {
        metric = metric.join('.');
    }
    url += '?metric=' + metric;
    if (value !== undefined) {
        url += '&value=' + value;
    }
    $.ajax({
        url: url,
        cache: false
    });
}

function gauge() {}
