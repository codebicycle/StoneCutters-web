'use strict';

module.exports = function(grunt) {
    return {
        js: {
            options: {
                sourceMap: true
            },
            files: [{
                expand: true,
                cwd: 'public/js/app',
                src: ['**/*.js', '!translations.js'],
                dest: 'public/js/min'
            }]
        },
        translations: {
            options: {
                sourceMap: true
            },
            files: [{
                expand: true,
                cwd: 'public/js/app',
                src: 'translations.js',
                dest: 'public/js/min'
            }]
        }
    };
};