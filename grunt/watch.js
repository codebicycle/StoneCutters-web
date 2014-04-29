'use strict';

module.exports = function(grunt) {
    return {
        scripts: {
            files: ['app/**/*.js', '!app/templates/default/**/*.js', '!app/templates/*olx*/**/*.js'],
            tasks: ['exec:removeAssets', 'browserify']
        },
        templates: {
            files: ['app/**/*.html', '!app/templates/compiled/**/*.html'],
            tasks: ['exec:removeTranslations', 'exec:removeTemplates', 'translate', 'template']
        },
        stylesheets: {
            files: ['app/**/*.styl', 'app/**/*.css'],
            tasks: ['exec:removeStyles', 'stylus']
        },
        node: {
            files: ['*.js', 'app/**/*.js', 'server/**/*.js', 'grunt/**/*.js', '!app/templates/**/*.js'],
            tasks: ['jshint:node']
        },
        tests: {
            files: ['test/**/*.js'],
            tasks: ['jshint:tests']
        },
        dist: {
            files: ['dist/index.js']
        }
    };
};
