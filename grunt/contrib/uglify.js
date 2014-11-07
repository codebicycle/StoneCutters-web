'use strict';

module.exports = function(grunt) {
    var utils = require('../utils');
    var environments = utils.getEnvironments(grunt);
    var uglify = {
        js: {
            options: {
                sourceMap: false
            },
            files: []
        },
        common: {
            options: {
                sourceMap: false
            },
            files: []
        },
        templates: {
            options: {
                sourceMap: false
            },
            files: []
        }
    };

    if (environments.length !== 1 || environments[0] !== 'development') {
        uglify.js.options.sourceMap = true;
        uglify.js.files.push({
            expand: true,
            cwd: 'public/js/src',
            src: ['**/*.js', '!common/**/*', '!**/templates/**/*'],
            dest: 'public/js/min'
        });
        uglify.common.options.sourceMap = true;
        uglify.common.files.push({
            expand: true,
            cwd: 'public/js/src/common',
            src: '**/*.js',
            dest: 'public/js/min/common'
        });
        uglify.templates.options.sourceMap = true;
        uglify.templates.files.push({
            expand: true,
            cwd: 'public/js/src',
            src: '**/templates/**/*.js',
            dest: 'public/js/min'
        });
    }

    return uglify;
};
