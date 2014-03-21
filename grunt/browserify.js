'use strict';

module.exports = function(grunt) {
    return {
        basic: {
            src: ['app/**/*.js'],
            dest: 'public/mergedAssets.js',
            options: {
                debug: true,
                alias: ['node_modules/rendr-handlebars/index.js:rendr-handlebars'],
                aliasMappings: [{
                    cwd: 'app/',
                    src: ['**/*.js'],
                    dest: 'app/'
                }],
                shim: {
                    jquery: {
                        path: 'assets/vendor/jquery-1.9.1.min.js',
                        exports: '$'
                    }
                }
            }
        }
    };
};
