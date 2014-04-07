var config = require('./config').get('newrelic', {});

delete config.enabled;
exports.config = config;
