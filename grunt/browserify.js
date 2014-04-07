'use strict';

module.exports = function(grunt) {
    return {
        basic: {
            src: ['public/js/lib/*.js'],
            dest: 'public/js/mergedAssets.js',
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
                        path: 'public/js/lib/jquery.js',
                        exports: '$'
                    }
                }
            }
        }
    };
};
