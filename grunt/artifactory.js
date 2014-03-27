'use strict';

module.exports = function(grunt) {
    return {
        options: {
            url: 'http://jfrog.olx.com.ar',
            repository: 'mobile-jenkins-release',
            username: 'mobile-jenkins',
            password: 'm0b1l30lx',
        },
        'build-dynamic': {
            files: [{
                cwd: 'dist',
                src: ['**']
            }],
            options: {
                publish: [{
                    id: 'olx.arwen:arwen-dynamic:zip:0.1.'+grunt.option('artifactory-version'),
                    name: 'arwen-dynamic',
                    path: 'dist/',
                    group_id: 'olx.arwen',
                    ext: 'zip'
                }]
            }
        },
        'build-static': {
            files: [{
                cwd: 'dist',
                src: ['**']
            }],
            options: {
                publish: [{
                    id: 'olx.arwen:arwen-static:zip:0.1.'+grunt.option('artifactory-version'),
                    name: 'arwen-static',
                    path: 'dist/',
                    group_id: 'olx.arwen',
                    ext: 'zip'
                }]
            }
        }
    };
};
