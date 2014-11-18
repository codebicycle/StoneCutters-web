'use strict';

module.exports = function(grunt) {
    var _ = require('underscore');
    var config = require('../config');
    var utils = require('../utils');
    var stylusConfig = config.get('stylus');
    var environments = utils.getEnvironments(grunt);
    var platforms = config.get('platforms');
    var stylus = {
        options: {
            'include css': true
        }
    };

    (function stylusGeneral() {
        var key;

        environments.forEach(function eachEnvironments(environment) {
            platforms.forEach(function (platform) {
                key = environment + '-' + platform;

                stylus[key] = {
                    files: {},
                    options: {
                        paths: [],
                        import: [],
                        define: {
                            staticUrl: (stylusConfig[environment] ? stylusConfig[environment].urls.static : ''),
                            imageUrl: (stylusConfig[environment] ? stylusConfig[environment].urls.image : '')
                        }
                    }
                };
                getFiles(environment, platform);
            });
        });


        function getFiles(environment, _platform) {
            var localization = config.get('localization', {}, environment);
            var files = {};
            var file;
            var platform;

            grunt.file.recurse('app/localized/default/stylesheets', function callback(abspath, rootdir, subdir, filename) {
                var parts = subdir.split('/');
                var target = 'public/css/default/' + parts[0] + '/styles';
                var helpers = {};
                var platform = parts[0];

                if (platform !== _platform) {
                    return;
                }

                if (parts[1] && parts[1] === 'helpers') {
                    helpers = rootdir + '/' + platform;
                    stylus[key].options.paths = [helpers];
                    stylus[key].options.import = ['helpers'];
                    return false;
                }
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
                if (platform !== _platform) {
                    continue;
                }
                localization[platform].forEach(eachLocation);
            }
            for (var target in files) {
                stylus[key].files[target] = [];
                for (file in files[target]) {
                    stylus[key].files[target].unshift(files[target][file]);
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
                        if (subdir && subdir === 'helpers') {
                            stylus[key].options.paths = [rootdir];
                            stylus[key].options.import = ['helpers'];
                            return false;
                        }
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
        var envs = _.clone(environments);
        var files = {};
        var key;

        if (!_.contains(envs, 'production')) {
            envs.push('production');
        }

        envs.forEach(function eachEnvironments(environment) {
            var icons = config.get('icons', {}, environment);
            var platform;

            if (_.isEmpty(icons)) {
                return;
            }
            for (platform in icons) {
                if (platform !== 'html5') {
                    continue;
                }
                addIcons(environment, platform, 'default');
                icons[platform].forEach(addIcons.bind({}, environment, platform));
            }
        });

        function addIcons(environment, platform, location) {
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