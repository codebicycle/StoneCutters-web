'use strict';

module.exports = function(grunt) {
    grunt.data = {
        rendrDir: 'node_modules/rendr',
        rendrHandlebarsDir: 'node_modules/rendr-handlebars',
        stylesheetsDir: 'assets/css'
    };

    require('load-grunt-config')(grunt);

    grunt.registerTask('runNode', function() {
        grunt.util.spawn({
            cmd: 'node',
            args: ['./node_modules/nodemon/nodemon.js', 'index.js'],
            opts: {
                stdio: 'inherit'
            }
        }, function() {
            grunt.fail.fatal(new Error("nodemon quit"));
        });
    });

    grunt.registerTask('clean', ['exec:delete_compiled_templates', 'exec:delete_merged_assets']);

    grunt.registerTask('es6', ['traceur', 'exec:add_new_line']);

    grunt.registerTask('unit-test', ['mochacov:test', 'mochacov:coverage']);

    grunt.registerTask('anonymous-finder', ['exec:anonymous_functions', 'anonymous-fx']);

    grunt.registerTask('anonymous-fx', 'Search for anonymous functions.', function handler(){
        grunt.task.requires('exec:anonymous_functions');
    });

    grunt.registerTask('dev-build',  ['handlebars', 'rendr_stitch', 'stylus']);

    grunt.registerTask('dist-build', ['clean','anonymous-finder','handlebars', 'rendr_stitch', 'stylus', 'uglify']);

    grunt.registerTask('pipeline', ['unit-test', 'dist-build', 'rsync:dist', 'rsync:stage', 'sshexec:npm-install', 'sshexec:stop', 'sshexec:start']);

    grunt.registerTask('server-dev', ['clean','anonymous-finder','runNode', 'dev-build', 'watch']);
};
