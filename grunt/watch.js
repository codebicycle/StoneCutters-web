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
        }
    };
};
