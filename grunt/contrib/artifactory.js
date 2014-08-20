'use strict';

module.exports = function(grunt) {
    var files = ['app/**/*', 'server/**/*', 'shared/**/*', 'public/favicon.ico', 'index.js', 'build.json', 'newrelic.js', 'package.json', 'start.sh'];
    var dependencies = grunt.file.readJSON('package.json').dependencies;

    for(var module in dependencies) {
        files.push('node_modules/' + module + '/**/*');
    }
    return {
        options: {
            url: 'http://jfrog.olx.com.ar',
            repository: 'mobile-jenkins-release',
            username: 'mobile-jenkins',
            password: 'm0b1l30lx',
        },
        dynamic: {
            files: [{
                src: files,
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
