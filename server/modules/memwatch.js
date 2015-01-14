'use strict';

var memwatch = require('memwatch');
var statsd = require('../modules/statsd')();

memwatch.on('stats', function onStats(stats) {
    Object.keys(stats).forEach(function each(key) {
        statsd.increment(['all', 'memwatch', key], stats[key]);
    });
});

memwatch.on('leak', function onLeak(leak) {
    statsd.increment(['all', 'memwatch', 'leak'], leak.growth);
});
