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
                src: '**/*.js',
                dest: 'public/js/app'
            }]
        }
    };
};
