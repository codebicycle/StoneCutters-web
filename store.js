'use strict';

var Store;
var store;

module.exports = function(express) {
    if (!express && !store) {
        return null;
    }

    if (store) {
        return store;
    }

    Store = require('connect-memcached')(express);
    store = new Store({
        hosts: ['localhost:11211']
    });

    return store;
};
