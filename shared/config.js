'use strict';

var environment = 'production';

if (typeof window === 'undefined') {
    var configName = '../server/config';
    var config = require(configName);

    environment = config.get('environment', 'development');
}

module.exports = require('../app/config')(environment);
