'use strict';

var _ = require('underscore');
var config = require('./config');

var replaces = {
    environments: {
        d: 'development',
        t: 'testing',
        s: 'staging',
        p: 'production'
    }
};

function getEnvironments(grunt) {
    var environments = grunt.option('env');

    if (!environments) {
        environments = config.get('environments');
    }
    if (!_.isArray(environments)) {
        environments = environments.split(',');
    }
    return environments.map(function(environment) {
        var replace = replaces.environments[environment.toLowerCase()];

        if (replace) {
            environment = replace;
        }
        return environment;
    });
}

module.exports = {
    getEnvironments: getEnvironments
};