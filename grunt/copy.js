'use strict';

module.exports = function(grunt) {
    var files = ['app/**/*', '!app/config/default.js', 'server/**/*', 'index.js', 'build.json', 'newrelic.js', 'package.json', 'start.sh'];
    var dependencies = grunt.file.readJSON('package.json').dependencies;

    for(var module in dependencies) {
        files.push('node_modules/' + module + '/**/*');
    }
    return {
        dynamic: {
            files: [{
                src: files,
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
