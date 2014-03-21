'use strict';

module.exports = function(grunt) {
    return {
        scripts: {
            files: ['app/**/*.js', '!app/**/compiledTemplates.js'],
            tasks: ['browserify']
        },
        templates: {
            files: ['app/**/*.hbs'],
            tasks: ['handlebars']
        }
    };
};
