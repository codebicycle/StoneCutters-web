'use strict'; 

module.exports = function(grunt) {
    return {
        js: {
            options: {
                sourceMap: true
            },
            files: [{
                expand: true,
                cwd: 'public/js/src',
                src: ['**/*.js', '!common/**/*', '!**/templates/**/*'],
                dest: 'public/js/min'
            }]
        },
        common: {
            options: {
                sourceMap: true
            },
            files: [{
                expand: true,
                cwd: 'public/js/src/common',
                src: '**/*.js',
                dest: 'public/js/min/common'
            }]
        },
        templates: {
            options: {
                sourceMap: true
            },
            files: [{
                expand: true,
                cwd: 'public/js/src',
                src: '**/templates/**/*.js',
                dest: 'public/js/min'
            }]
        }
    };
};
