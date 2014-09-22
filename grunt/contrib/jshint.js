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
        shared: {
            src: ['shared/**/*.js'],
            options: {
                browser: true,
                predef: ['$'],
                '-W040': true
            }
        },
        client: {
            src: ['app/**/*.js'],
            options: {
                ignores: ['app/lib/**/*.js'],
                browser: true,
                predef: ['$', '_gaq', 'EXIF', 'confirm'],
                '-W040': true
            }
        },
        tests: {
            src: ['tests/**/*.js'],
            options: {
                predef: ['expect', 'sinon', 'describe', 'before', 'beforeEach', 'it', 'proxyquire', 'asynquence'],
                '-W030': true
            }
        }
    };
};
