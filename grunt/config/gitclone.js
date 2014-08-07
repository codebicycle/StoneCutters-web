'use strict';

module.exports = function(grunt) {
    return {
        config: {
            options: {
                repository: 'git@github.com:olx-inc/mobile-webapp-conf.git',
                branch: grunt.option('environment') || 'testing',
                directory: 'dist/git'
            }
        },
        'flags-testing': {
            options: {
                repository: 'git@github.com:nicolas-molina-olx/mobile-webapp-flags.git',
                branch: 'develop',
                directory: 'dist/git'
            }
        },
        'flags-production': {
            options: {
                repository: 'git@github.com:nicolas-molina-olx/mobile-webapp-flags.git',
                branch: 'master',
                directory: 'dist/git'
            }
        }
    };
};
