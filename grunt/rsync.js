'use strict';

module.exports = function(grunt) {
    return {
        options: {
            args: ["--verbose"],
            exclude: [".git*","*.scss","node_modules"],
            recursive: true
        },
        dist: {
            options: {
                src: "./",
                dest: "./dist"
            }
        },
        stage: {
            options: {
                src: "./dist/",
                dest: "/root/apps/arwen/",
                host: "root@nodebox",
                syncDestIgnoreExcl: true
            }
         },
        prod: {
             options: {
                 src: "./dist/",
                 dest: "/root/apps/arwen/",
                 host: "root@nodebox",
                 syncDestIgnoreExcl: true
             }
          }
    };
};