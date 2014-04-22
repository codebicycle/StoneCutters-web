'use strict';

var config = require('./config');
var Memcached;
var memcached;

module.exports = function(express) {
    if (!express && !memcached) {
        return null;
    }

    if (memcached) {
        return memcached;
    }

    Memcached = require('connect-memcached')(express);
    memcached = new Memcached(config.get('memcached', {}));

    return memcached;
};
