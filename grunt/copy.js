'use strict';

module.exports = function(grunt) {
    var dynamic = ['app/**/*', '!app/config/default.js', 'server/**/*', 'index.js', 'build.json', 'newrelic.js', 'package.json', 'start.sh'];
    var dependencies = grunt.file.readJSON('package.json').dependencies;
    var path = require('path');
    var _ = require('underscore');
    var localization = require('../server/config').get('localization');
    var iconsLocalization = require('../app/config').get('icons');
    var templates = [{
        src: ['app/templates/__layout.html'],
        dest: 'app/templates/compiled/__layout.html'
    }];
    var icons = [];

    (function copyTemplates() {
        var files = {};
        var platform;

        grunt.file.recurse('app/templates/default', function callback(abspath, rootdir, subdir, filename) {
            var parts = subdir.split('/');
            var dest = 'app/templates/compiled/default/' + subdir + '/' + filename;

            if (filename.split('.').pop() !== 'html') {
                return;
            }
            files[dest] = {
                src: [abspath],
                dest: dest
            };
            for (var platform in localization) {
                if (platform !== parts[0]) {
                    continue;
                }
                localization[platform].forEach(eachLocation);
            }

            function eachLocation(location) {
                var localized = dest.replace('default', location);

                files[localized] = {
                    src: [abspath],
                    dest: localized
                };
            }
        });
        for (platform in localization) {
            localization[platform].forEach(eachLocation);
        }

        function eachLocation(location) {
            var dir = 'app/templates/' + location + '/' + platform;

            if (grunt.file.exists(dir)) {
                grunt.file.recurse(dir, function each(abspath, rootdir, subdir, filename) {
                    var dest = 'app/templates/compiled/' + location + '/' + platform + '/' + subdir + '/' + filename;

                    if (filename.split('.').pop() !== 'html') {
                        return;
                    }
                    files[dest] = {
                        src: [abspath],
                        dest: dest
                    };
                });
            }
        }

        for (var template in files) {
            templates.push(files[template]);
        }
    })();

    (function copyIcons() {
        var files = {};
        var platform;
        
        grunt.file.recurse('app/icons/default', function callback(abspath, rootdir, subdir, filename) {
            var dest = 'public/images/' + subdir + '/icons/default/' + filename;

            if (!(~['gif', 'png', 'ico', 'jpg', 'jpeg'].indexOf(filename.split('.').pop()))) {
                return;
            }
            files[dest] = {
                src: [abspath],
                dest: dest
            };
            for (var platform in iconsLocalization) {
                if (platform !== subdir) {
                    continue;
                }
                iconsLocalization[platform].forEach(eachIconLocation);
            }

            function eachIconLocation(location) {
                var localized = dest.replace('default', location);

                files[localized] = {
                    src: [abspath],
                    dest: localized
                };
            }
        });
        for (platform in iconsLocalization) {
            iconsLocalization[platform].forEach(eachIconLocation);
        }

        function eachIconLocation(location) {
            var dir = 'public/images/' + platform + '/icons/' + location;

            if (grunt.file.exists(dir)) {
                grunt.file.recurse(dir, function each(abspath, rootdir, subdir, filename) {
                    var dest = 'public/images/' + platform + '/icons/' + location + '/' + filename;

                    if (!(~['gif', 'png', 'ico', 'jpg', 'jpeg'].indexOf(filename.split('.').pop()))) {
                        return;
                    }
                    files[dest] = {
                        src: [abspath],
                        dest: dest
                    };
                });
            }
        }

        for (var icon in files) {
            icons.push(files[icon]);
        }
    })();

    for(var module in dependencies) {
        dynamic.push('node_modules/' + module + '/**/*');
    }
    return {
        dynamic: {
            files: [{
                src: dynamic,
                dest: 'dist/'
            }]
        },
        'static': {
            files: [{
                src: ['public/**/*'],
                dest: 'dist/'
            }]
        },
        config: {
            files: [{
                cwd: 'dist/git',
                src: ['**'],
                dest: 'dist/'
            }]
        },
        templates: {
            files: templates
        },
        icons: {
            files: icons
        }
    };
};
