var _ = require('underscore');
var CONFIG = require('config').newrelic;
var config = _.clone(CONFIG);

delete config.enabled;
exports.config = config;
