'use strict';

var CONFIG = require('config').memcached;
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
    memcached = new Memcached(CONFIG);

    return memcached;
};
