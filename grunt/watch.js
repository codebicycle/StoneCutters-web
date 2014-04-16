'use strict';

module.exports = function(grunt) {
    return {
        scripts: {
            files: ['app/**/*.js', '!app/**/compiledTemplates.js'],
            tasks: ['exec:removeAssets', 'browserify']
        },
        templates: {
            files: ['app/**/*.hbs'],
            tasks: ['exec:removeTemplates', 'handlebars']
        },
        stylesheets: {
            files: ['app/**/*.styl', 'app/**/*.css'],
            tasks: ['exec:removeStyles', 'stylus']
        },
        node: {
            files: ['*.js', 'app/**/*.js', 'server/**/*.js', 'grunt/**/*.js'],
            tasks: ['jshint:node']
        },
        tests: {
            files: ['test/**/*.js'],
            tasks: ['jshint:tests']
        }
    };
};
