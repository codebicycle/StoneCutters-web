'use strict';

module.exports = function(grunt) {
    var _ = require('underscore');
    var config = require('../config');
    var utils = require('../utils');
    var stylusConfig = config.get('stylus');
    var environments = utils.getEnvironments(grunt);
    var stylus = {
        options: {
            'include css': true
        }
    };

    (function stylusGeneral() {
        var localization = config.get('localization');

        environments.forEach(function eachEnvironments(environment) {
            stylus[environment] = {
                files: {},
                options: {
                    define: {
                        staticUrl: (stylusConfig[environment] ? stylusConfig[environment].urls.static : ''),
                        imageUrl: (stylusConfig[environment] ? stylusConfig[environment].urls.image : '')
                    }
                }
            };
            getFiles(environment);
        });

        function getFiles(environment) {
            var files = {};
            var file;
            var platform;

            grunt.file.recurse('app/localized/default/stylesheets', function callback(abspath, rootdir, subdir, filename) {
                var parts = subdir.split('/');
                var target = 'public/css/default/' + parts[0] + '/styles';

                if (environment !== 'production') {
                    target += '-' + environment;
                }
                target += '.css';
                if (filename.split('.').pop() !== 'styl') {
                    return;
                }
                if (!files[target]) {
                    files[target] = {};
                }
                files[target][abspath] = abspath;
            });

            for (platform in localization) {
                localization[platform].forEach(eachLocation);
            }
            for (var target in files) {
                stylus[environment].files[target] = [];
                for (file in files[target]) {
                    stylus[environment].files[target].unshift(files[target][file]);
                }
            }

            function eachLocation(location) {
                var dir = 'app/localized/' + location + '/stylesheets/' + platform;
                var defaultTarget = 'public/css/default/' + platform + '/styles';
                var target = 'public/css/' + location + '/' + platform + '/styles';

                if (environment !== 'production') {
                    defaultTarget += '-' + environment;
                    target += '-' + environment;
                }
                defaultTarget += '.css';
                target += '.css';
                if (!files[target]) {
                    files[target] = _.clone(files[defaultTarget]);
                }
                if (grunt.file.exists(dir)) {
                    grunt.file.recurse(dir, function each(abspath, rootdir, subdir, filename) {
                        if (filename.split('.').pop() !== 'styl') {
                            return;
                        }
                        files[target][abspath.replace('/' + location + '/', '/default/')] = abspath;
                    });
                }
            }
        }
    })();

    (function stylusIcons() {
        var iconsLocalization = config.get('icons');
        var files = {};
        var platform;
        var key;

        for (platform in iconsLocalization) {
            if (platform !== 'html5') {
                continue;
            }
            iconsLocalization[platform].forEach(eachIconLocation);
        }

        platform = 'html5';
        eachIconLocation('default');

        function eachIconLocation(location) {
            environments.forEach(function eachEnvironments(environment) {
                addIconToStylus(location, environment);
            });
        }

        function addIconToStylus(location, environment) {
            var fileName = ['public/css/', location, '/', platform, '/icons'];
            var key = ['icons-', environment].join('');

            if (!stylus[key]) {
                stylus[key] = {
                    files: {},
                    options: {
                        define: {
                            staticUrl: '',
                            imageUrl: ''
                        }
                    }
                };
            }
            if (environment !== 'production') {
                fileName.push('-');
                fileName.push(environment);
            }
            if (environment !== 'development') {
                stylus[key].options.define.staticUrl = stylusConfig[environment].urls.static;
                stylus[key].options.define.imageUrl = stylusConfig[environment].urls.image;
            }
            fileName.push('.css');
            fileName = fileName.join('');
            stylus[key].files[fileName] = fileName;
        }
    })();

    return stylus;
};