'use strict';

module.exports = function(grunt) {
    require('load-grunt-config')(grunt);

    grunt.registerTask('develop', function run() {
        grunt.util.spawn({
            cmd: 'npm',
            args: ['run-script', 'develop'],
            opts: {
                stdio: 'inherit'
            }
        }, function error(err) {
            grunt.fail.fatal(err.stack);
        });
    });

    grunt.registerTask('log', function log() {
        grunt.util.spawn({
            cmd: 'npm',
            args: ['run-script', 'debug'],
            opts: {
                stdio: 'inherit'
            }
        }, function error(err) {
            grunt.fail.fatal(err.stack);
        });
    });

    grunt.registerTask('clean', ['exec:removeTemplates', 'exec:removeAssets']);

    grunt.registerTask('build', ['handlebars', 'browserify']);

    grunt.registerTask('rebuild', ['clean', 'build']);

    grunt.registerTask('jshint:node', ['jshint:server', 'jshint:client']);

    grunt.registerTask('start', ['rebuild', 'jshint:node', 'develop', 'watch']);

    grunt.registerTask('debug', ['rebuild', 'jshint:node', 'log', 'watch']);

    grunt.registerTask('pipeline-rackspace', ['test', 'rebuild', 'rsync:dist', 'rsync:stage', 'sshexec:npm-install', 'sshexec:stop', 'sshexec:start']);

    grunt.registerTask('pipeline-artifactory', ['rebuild', 'rsync:dist', 'artifactory:build-static:publish', 'artifactory:build-dynamic:publish']);

    grunt.registerTask('test', ['jshint:tests', 'mochacov:test', 'mochacov:coverage']);
};
