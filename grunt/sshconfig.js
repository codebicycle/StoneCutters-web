'use strict';

module.exports = function(grunt) {
    return {
      testing: {
        host: "nodebox",
        port: 22,
        username: "root",
        agent: process.env.SSH_AUTH_SOCK,

        //"/home/dev/.ssh/id_rsa"
        privateKey: grunt.file.read(grunt.file.readJSON('conf.json').auth)
      }
    };
};