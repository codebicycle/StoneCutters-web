'use strict';

var _ = require('underscore');
var config = require('./config');

function getEnvironments(grunt) {
    var environments = grunt.option('env');

    if (!environments) {
        environments = config.get('environments');
    }
    if (!_.isArray(environments)) {
        environments = environments.split(',');
    }
    return environments;
}

module.exports = {
    getEnvironments: getEnvironments
};