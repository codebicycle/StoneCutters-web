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
                alias: ['node_modules/rendr-nunjucks/index.js:rendr-nunjucks', 'node_modules/nunjucks/browser/nunjucks-slim.js:nunjucks'],
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
