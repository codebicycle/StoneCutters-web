'use strict';

module.exports = function(grunt) {
    require('load-grunt-config')(grunt);

    grunt.registerTask('run', function run() {
        grunt.util.spawn({
            cmd: 'node',
            args: ['index.js'],
            opts: {
                stdio: 'inherit'
            }
        }, function error() {
            grunt.fail.fatal(new Error("nodemon quit"));
        });
    });

    grunt.registerTask('clean', ['exec:removeTemplates', 'exec:removeAssets']);

    grunt.registerTask('build', ['handlebars', 'browserify']);

    grunt.registerTask('rebuild', ['clean', 'build']);

    grunt.registerTask('jshint:node', ['jshint:server', 'jshint:client']);

    grunt.registerTask('start', ['rebuild', 'jshint:node', 'run', 'watch']);

    grunt.registerTask('pipeline-rackspace', ['test', 'rebuild', 'rsync:dist', 'rsync:stage', 'sshexec:npm-install', 'sshexec:stop', 'sshexec:start']);

    grunt.registerTask('pipeline-artifactory', ['rebuild', 'rsync:dist', 'artifactory:build-static:publish', 'artifactory:build-dynamic:publish']);

    grunt.registerTask('test', ['jshint:tests', 'mochacov:test', 'mochacov:coverage']);
};
