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
                src: ['dist/**/*']
            }],
            options: {
                publish: [{
                    id: 'olx.arwen:dynamic:zip:1000'
                }]
            }
        },
        'build-static': {
            files: [{
                src: ['dist/**/*']
            }],
            options: {
                publish: [{
                    id: 'olx.arwen:static:zip:1000'
                }]
            }
        }
    };
};
