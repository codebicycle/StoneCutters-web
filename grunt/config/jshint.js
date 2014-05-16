'use strict';

module.exports = function(grunt) {
    return {
        options: {
            force: true,
            node: true
        },
        server: {
            src: ['*.js', 'server/**/*.js', 'grunt/**/*.js']
        },
        client: {
            src: ['app/**/*.js'],
            options: {
                ignores: ['app/lib/**/*.js', 'app/templates/**/*.js'],
                browser: true,
                predef: ['$', '_gaq'],
                '-W040': true
            }
        },
        utests: {
            src: ['test/unit/**/*.js'],
            options: {
                predef: ['describe', 'before', 'it']
            }
        },
        atests: {
            src: ['test/acceptance/**/*.js'],
            options: {
                predef: ['describe', 'before', 'it']
            }
        }
    };
};
