'use strict';

module.exports = function(grunt) {
    return {
        scripts: {
            files: ['app/**/*.js', 'shared/**/*.js', '!app/translations/**/*.js'],
            tasks: ['exec:removeAssets', 'template', 'javascript']
        },
        templates: {
            files: ['app/**/*.html', '!app/templates/**/*.html'],
            tasks: ['exec:removeTemplates', 'template']
        },
        stylesheets: {
            files: ['app/**/*.styl', 'app/**/*.css'],
            tasks: ['exec:removeStyles', 'stylus']
        },
        node: {
            files: ['*.js', 'app/**/*.js', 'server/**/*.js', 'shared/**/*.js', 'grunt/**/*.js', '!translations/**/*', '!app/translations/**/*', '!public/**/*'],
            tasks: ['jshint:node']
        },
        utests: {
            files: ['test/unit/**/*.js'],
            tasks: ['jshint:utests']
        },
        atests: {
            files: ['test/acceptance/**/*.js'],
            tasks: ['jshint:atests']
        },
        dist: {
            files: ['dist/index.js']
        }
    };
};
