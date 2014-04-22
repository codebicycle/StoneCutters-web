'use strict';

module.exports = function(grunt) {
    return {
        options: {
            url: 'http://jfrog.olx.com.ar',
            repository: 'mobile-jenkins-release',
            username: 'mobile-jenkins',
            password: 'm0b1l30lx',
        },
        'dynamic': {
            files: [{
                src: ['app/**/*', '!app/config/default.js', 'node_modules/**/*', 'server/**/*', 'index.js', 'build.json'],
            }],
            options: {
                publish: [{
                    id: 'olx.mobile-webapp:mobile-webapp-dynamic:zip:1.1.' + grunt.option('artifactory-version'),
                    name: 'mobile-webapp-dynamic',
                    path: '',
                    group_id: 'olx.mobile-webapp',
                    ext: 'zip'
                }]
            }
        },
        'static': {
            files: [{
                expand: true,
                cwd: 'public/',
                src: ['**']
            }],
            options: {
                publish: [{
                    id: 'olx.mobile-webapp:mobile-webapp-static:zip:1.1.' + grunt.option('artifactory-version'),
                    name: 'mobile-webapp-static',
                    path: '',
                    group_id: 'olx.mobile-webapp',
                    ext: 'zip'
                }]
            }
        }
    };
};
