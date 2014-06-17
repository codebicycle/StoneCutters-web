'use strict';

var config = require('./config');
var Memcached = require('memcached');

module.exports = new Memcached(config.get(['memcached', 'hosts'], 'localhost:11211'), config.get('memcached'));
