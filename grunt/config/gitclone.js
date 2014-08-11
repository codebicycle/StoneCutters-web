'use strict';

module.exports = function(grunt) {
    return {
        config: {
            options: {
                repository: 'git@github.com:olx-inc/mobile-webapp-conf.git',
                branch: grunt.option('environment') || 'testing',
                directory: 'dist/git'
            }
        }
    };
};
