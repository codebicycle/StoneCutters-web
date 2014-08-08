'use strict';

var config = require('./config').get('statsd', {
    client: {
        host: 'graphite-server',
        port: 8125,
        prefix: 'application.mobile.webapp.'
    }
});
var StatsD = require('node-statsd').StatsD;
module.exports = new StatsD({ prefix: config.client.prefix, host: config.client.host, cacheDns: true, });
