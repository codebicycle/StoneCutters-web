'use strict';

module.exports = function(grunt) {
    return {
        dynamic: {
            files: [{
                src: ['app/**/*', '!app/config/default.js', 'node_modules/**/*', 'server/**/*', 'index.js', 'build.json', 'newrelic.js', 'start.sh', 'package.json'],
                dest: 'dist/'
            }]
        },
        'static': {
            files: [{
                src: ['public/**/*'],
                dest: 'dist/'
            }]
        },
        config: {
            files: [{
                cwd: 'dist/git',
                src: ['**'],
                dest: 'dist/'
            }]
        }
    };
};
