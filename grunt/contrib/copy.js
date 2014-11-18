'use strict';

module.exports = function(grunt) {
    var dynamic = ['app/**/*', '!app/config/default.js', 'server/**/*', 'index.js', 'build.json', 'newrelic.js', 'package.json', 'start.sh'];
    var dependencies = grunt.file.readJSON('package.json').dependencies;
    var path = require('path');
    var _ = require('underscore');
    var config = require('../config');
    var utils = require('../utils');
    var environments = utils.getEnvironments(grunt);
    var templates = [{
        src: ['app/localized/common/templates/__layout.html'],
        dest: 'app/templates/__layout.html'
    }];
    var icons = [];
    var sprites = [];

    (function copyTemplates() {
        var files = {};
        var platform;

        grunt.file.recurse('app/localized/default/templates', function callback(abspath, rootdir, subdir, filename) {
            var parts = subdir ? subdir.split('/') : [];
            var dest = 'app/templates/default/' + (subdir ? subdir + '/' : '') + filename;

            if (filename.split('.').pop() !== 'html') {
                return;
            }
            files[dest] = {
                src: [abspath],
                dest: dest
            };
            environments.forEach(function eachEnvironments(environment) {
                var localization = config.get('localization', {}, environment);
                var platform;

                for (platform in localization) {
                    if (platform !== parts[0]) {
                        continue;
                    }
                    localization[platform].forEach(eachLocation);
                }
            });

            function eachLocation(location) {
                var localized = dest.replace('default', location);

                files[localized] = {
                    src: [abspath],
                    dest: localized
                };
            }
        });
        environments.forEach(function eachEnvironments(environment) {
            var localization = config.get('localization', {}, environment);
            var platform;

            for (platform in localization) {
                localization[platform].forEach(eachLocation.bind(null, platform));
            }
        });

        function eachLocation(platform, location) {
            var dir = 'app/localized/' + location + '/templates/' + platform;

            if (grunt.file.exists(dir)) {
                grunt.file.recurse(dir, function each(abspath, rootdir, subdir, filename) {
                    var dest = 'app/templates/' + location + '/' + platform + '/' + subdir + '/' + filename;

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

        grunt.file.recurse('app/localized/default/icons', function callback(abspath, rootdir, subdir, filename) {
            var dest = 'public/images/' + subdir + '/icons/default/' + filename;

            if (!(~['gif', 'png', 'ico', 'jpg', 'jpeg'].indexOf(filename.split('.').pop()))) {
                return;
            }
            files[dest] = {
                src: [abspath],
                dest: dest
            };
            environments.forEach(function eachEnvironments(environment) {
                var icons = config.get('icons', {}, environment);
                var platform;

                for (platform in icons) {
                    if (platform !== subdir) {
                        continue;
                    }
                    if (platform === 'html5') {
                        continue;
                    }
                    icons[platform].forEach(eachIconLocation);
                }
            });

            function eachIconLocation(location) {
                var localized = dest.replace('default', location);

                files[localized] = {
                    src: [abspath],
                    dest: localized
                };
            }
        });
        environments.forEach(function eachEnvironments(environment) {
            var icons = config.get('icons', {}, environment);
            var platform;

            for (platform in icons) {
                if (platform === 'html5') {
                    continue;
                }
                icons[platform].forEach(eachIconLocation.bind(null, platform));
            }
        });

        function eachIconLocation(platform, location) {
            var dir = 'app/localized/' + location + '/icons/' + platform;

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

    (function copySprites() {
        var files = {};
        var sprite;

        environments.forEach(function eachEnvironments(environment) {
            var icons = config.get('icons', {}, environment);
            var platform;

            for (platform in icons) {
                if (platform !== 'html5') {
                    continue;
                }
                addIcons(environment, platform, 'default');
                icons[platform].forEach(addIcons.bind(null, environment, platform));
            }
        });

        function addIcons(environment, platform, location) {
            if (environment === 'production') {
                return;
            }
            files[[location, '-', environment].join('')] = {
                src: ['public/css/', location, '/', platform, '/icons.css'].join(''),
                dest: ['public/css/', location, '/', platform, '/icons-', environment, '.css'].join('')
            };
        }

        for (sprite in files) {
            sprites.push(files[sprite]);
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
        },
        sprites: {
            files: sprites
        }
    };
};
