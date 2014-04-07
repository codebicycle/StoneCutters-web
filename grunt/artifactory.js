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
                src: ['app/**/*', 'node_modules/**/*', 'server/**/*', 'cache.js', 'memcached.js', 'appConf.js', 'bootstrap.js', 'cluster.js', 'index.js', 'newrelic.js'],
            }],
            options: {
                publish: [{
                    id: 'olx.arwen:arwen-dynamic:zip:' + grunt.option('artifactory-version'),
                    name: 'arwen-dynamic',
                    path: '',
                    group_id: 'olx.arwen',
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
                    id: 'olx.arwen:arwen-static:zip:' + grunt.option('artifactory-version'),
                    name: 'arwen-static',
                    path: '',
                    group_id: 'olx.arwen',
                    ext: 'zip'
                }]
            }
        }
    };
};
