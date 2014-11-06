'use strict';

var _ = require('underscore');
var utils = require('../../shared/utils');
var CONFIG = _.extend({}, require('./default'), {
    translations: require('./translations')
});
var configClientDevelopment = require('../../app/config')('development');
var configClientTesting = require('../../app/config')('testing');
var configClientStaging = require('../../app/config')('staging');
var configClient = require('../../app/config')('production');

module.exports = function() {
    var configs = {
        development: configClientDevelopment,
        testing: configClientTesting,
        staging: configClientStaging,
        production: configClient
    };

    function getByEnvironment(env, keys, defaultValue) {
        var config = configs[env];
        var value;

        if (config) {
            value = config.get(keys, defaultValue);
        }
        return value;
    }

    function get(keys, defaultValue, env) {
        var value = utils.get(CONFIG, keys);

        if (value === null || _.isUndefined(value)) {
            value = getByEnvironment(env || 'production', keys, defaultValue);
        }
        return value;
    }

    return {
        get: get
    };
}();
