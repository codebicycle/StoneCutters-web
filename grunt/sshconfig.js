'use strict';

module.exports = function(grunt) {
    var privateKey = '';

    if (grunt.file.exists('conf.json')) {
        privateKey = grunt.file.read(grunt.file.readJSON('conf.json').auth);
    }
    return {
      testing: {
        host: "nodebox",
        port: 22,
        username: "root",
        agent: process.env.SSH_AUTH_SOCK,
        privateKey: privateKey
      }
    };
};
