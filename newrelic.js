var config = require('./server/config').get('newrelic', {});

delete config.enabled;
exports.config = config;