'use strict';

module.exports = function(grunt) {
    return function task() {
        grunt.util.spawn({
            cmd: './dist/start.sh',
            args: [grunt.option('environment') || 'testing'],
            opts: {
                stdio: 'inherit'
            }
        }, function error(err) {
            grunt.fail.fatal(err.stack);
        });
    };
};
