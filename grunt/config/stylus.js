'use strict';

module.exports = function(grunt) {
    var _ = require('underscore');
    var localization = require('../../app/config').get('localization');
    var environments = require('../../server/config').get('stylus');
    var stylus = {
        options: {
            'include css': true
        },
        development: {
            files: {},
            options: {
                define: {
                    staticUrl: '',
                    imageUrl: ''
                }
            }
        }
    };
    var environment;

    getFiles('development');
    for (environment in environments) {
        stylus[environment] = {
            files: {},
            options: {
                define: {
                    staticUrl: environments[environment].urls.static,
                    imageUrl: environments[environment].urls.image
                }
            }
        };
        getFiles(environment);
    }

    function getFiles(environment) {
        var files = {};
        var file;
        var platform;

        grunt.file.recurse('app/localized/default/stylesheets', function callback(abspath, rootdir, subdir, filename) {
            var parts = subdir.split('/');
            var target = 'public/css/default/' + parts[0] + '/styles';

            if (environment !== 'development') {
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

            if (environment !== 'development') {
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

    (function stylusIcons() {
        var iconsLocalization = require('../../app/config').get('icons');
        var files = {};
        var platform;
        var key;

        for (platform in iconsLocalization) {
            if (platform !== 'html5') {
                continue;
            }
            iconsLocalization[platform].forEach(eachIconLocation);
        }

        function eachIconLocation(location) {
            var environment;

            addIconToStylus(location, 'development');
            for (environment in environments) {
                addIconToStylus(location, environment);
            }
        }

        function addIconToStylus(location, environment) {
            var fileName = ['public/css/', location, '/', platform, '/icons'];
            var key = ['icons-', environment].join('');

            if (!stylus[key]) {
                stylus[key] = {
                    files: {},
                    options: {
                        compress: false,
                        define: {
                            staticUrl: '',
                            imageUrl: ''
                        }
                    }
                };
            }
            if (environment !== 'development') {
                fileName.push('-');
                fileName.push(environment);
                stylus[key].options.define.staticUrl = environments[environment].urls.static;
                stylus[key].options.define.imageUrl = environments[environment].urls.image;
            }
            fileName.push('.css');
            fileName = fileName.join('');
            stylus[key].files[fileName] = fileName;
        }

        platform = 'html5';
        eachIconLocation('default');
    })();

    return stylus;
};
