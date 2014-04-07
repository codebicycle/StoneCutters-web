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
                        path: 'public/js/lib/jquery.js',
                        exports: '$'
                    },
                    swiper: {
                        path: 'public/js/lib/swiper.js',
                        exports: 'swiper'
                    }
                }
            }
        }
    };
};
