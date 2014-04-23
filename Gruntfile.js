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

    grunt.registerTask('startDist', function log() {
        grunt.util.spawn({
            cmd: './dist/start.sh',
            args: [grunt.option('environment') || 'testing'],
            opts: {
                stdio: 'inherit'
            }
        }, function error(err) {
            grunt.fail.fatal(err.stack);
        });
    });

    grunt.registerTask('clean', ['exec:removeTemplates', 'exec:removeAssets', 'exec:removeStyles']);

    grunt.registerTask('build', ['nunjucks', 'browserify', 'stylus']);

    grunt.registerTask('rebuild', ['clean', 'build']);

    grunt.registerTask('jshint:node', ['jshint:server', 'jshint:client']);

    grunt.registerTask('copy:code', ['copy:dynamic', 'copy:static']);

    grunt.registerTask('start', ['rebuild', 'jshint:node', 'develop', 'watch']);

    grunt.registerTask('debug', ['rebuild', 'jshint:node', 'log', 'watch']);

    grunt.registerTask('pipetest', ['exec:removeDist', 'rebuild', 'copy:code', 'gitclone', 'copy:config', 'exec:removeDistGit', 'exec:chmodDistStart', 'startDist', 'watch:dist']);

    grunt.registerTask('pipeline', ['rebuild', 'artifactory:static:publish', 'artifactory:dynamic:publish']);

    grunt.registerTask('test', ['jshint:tests', 'mochacov:test', 'mochacov:coverage']);
};
