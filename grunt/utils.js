'use strict';

var _ = require('underscore');
var config = require('./config');

var options = {
    environments: {
        d: 'development',
        t: 'testing',
        s: 'staging',
        p: 'production'
    },
    localization: {
        wap: [],
        html5: [],
        html4: [],
        desktop: []
    }
};

function option(grunt, keys, defaultValue) {
    var value = defaultValue;

    if (_.isString(keys)) {
        keys = [keys];
    }
    _.each(keys, function each(k) {
        value = grunt.option(k) || value;
    });
    return value;
}

function getEnvironments(grunt) {
    var environments = option(grunt, 'env');

    if (!environments) {
        environments = config.get('environments');
    }
    if (!_.isArray(environments)) {
        environments = environments.split(',');
    }
    return environments.map(function(environment) {
        var replace = options.environments[environment.toLowerCase()];

        if (replace) {
            environment = replace;
        }
        return environment;
    });
}

function getLocalization(grunt, defaultValue, environment) {
    var noLocalize = option(grunt, ['nl', 'no-localize']);

    if (noLocalize) {
        return options.localization;
    }
    return config.get('localization', defaultValue, environment);
}

module.exports = {
    option: option,
    getEnvironments: getEnvironments,
    getLocalization: getLocalization
};