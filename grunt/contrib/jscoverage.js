'use strict';

module.exports = function(grunt) {
    return {
        server: {
            expand: true,
            cwd: 'server/',
            src: ['**/*.js'],
            dest: 'coverage/server/',
            ext: '.js'
        },
        shared: {
            expand: true,
            cwd: 'shared/',
            src: ['**/*.js'],
            dest: 'coverage/shared/',
            ext: '.js'
        },
        app: {
            expand: true,
            cwd: 'app/',
            src: ['**/*.js'],
            dest: 'coverage/app/',
            ext: '.js'
        }
    };
};
