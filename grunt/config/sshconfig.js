'use strict';

module.exports = function(grunt) {
    var privateKey = '';

    if (grunt.file.exists('conf.json')) {
        var conf = grunt.file.readJSON('conf.json');

        if (conf && conf.auth && grunt.file.exists(conf.auth)) {
            privateKey = grunt.file.read(conf.auth);
        }
    }
    return {
      testing: {
        host: 'nodebox',
        port: 22,
        username: 'root',
        agent: process.env.SSH_AUTH_SOCK,
        privateKey: privateKey
      }
    };
};
