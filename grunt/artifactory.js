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
                    id: 'olx.arwen:arwen-dynamic:zip:1.1.1',
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
                    id: 'olx.arwen:arwen-static:zip:1.1.1',
                    name: 'arwen-static',
                    path: 'dist/',
                    group_id: 'olx.arwen',
                    ext: 'zip'
                }]
            }
        }
    };
};
