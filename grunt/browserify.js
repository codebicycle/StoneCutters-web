'use strict';

module.exports = function(grunt) {
    return {
        lib: {
            src: ['public/js/lib/**/*.js'],
            dest: 'public/js/libs.js',
            options: {
                aliasMappings: [{
                    cwd: 'public/js/',
                    src: ['**/*.js'],
                    dest: 'public/js/'
                }]
            }
        },
        app: {
            src: ['app/**/*.js'],
            dest: 'public/js/app.js',
            options: {
                alias: ['node_modules/rendr-handlebars/index.js:rendr-handlebars'],
                aliasMappings: [{
                    cwd: 'app/',
                    src: ['**/*.js'],
                    dest: 'app/'
                }],
                external: ['jquery']
            }
        }
    };
};
