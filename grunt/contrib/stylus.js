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
        environments.forEach(function eachEnvironments(environment) {
            platforms.forEach(function (platform) {
                prepareFiles(environment, platform);
            });
        });

        function prepareFiles(environment, _platform) {
            var localization = utils.getLocalization(grunt, {}, environment);
            var defaultData = findDefaultData(environment, _platform);
            var options = {
                environment: environment
            };
            var platform;
            var data;

            for (platform in localization) {
                if (platform !== _platform) {
                    continue;
                }
                _.extend(options, {
                    platform: platform
                });
                prepareTask(defaultData, _.extend(options, {
                    location: 'default'
                }));
                localization[platform].forEach(eachLocation.bind(null, defaultData, options));
            }

            function eachLocation(defaultData, options, location) {
                var data = findLocationData(location, defaultData);

                prepareTask(data, _.extend(options, {
                    location: location
                }));
            }

            function findLocationData(location, defaultData) {
                var dir = 'app/localized/' + location + '/stylesheets/' + platform;
                var defaultTarget = 'public/css/default/' + platform + '/styles';
                var target = 'public/css/' + location + '/' + platform + '/styles';
                var data = {
                    files: _.clone(defaultData.files),
                    options: _.clone(defaultData.options)
                };

                if (environment !== 'production') {
                    defaultTarget += '-' + environment;
                    target += '-' + environment;
                }
                defaultTarget += '.css';
                target += '.css';
                if (!data.files[target]) {
                    data.files[target] = _.clone(data.files[defaultTarget]);
                }
                if (grunt.file.exists(dir)) {
                    grunt.file.recurse(dir, function each(abspath, rootdir, subdir, filename) {
                        if (subdir && subdir === 'helpers') {
                            data.options.paths = [rootdir];
                            data.options.import = ['helpers'];
                            return false;
                        }
                        if (filename.split('.').pop() !== 'styl') {
                            return;
                        }
                        data.files[target][abspath.replace('/' + location + '/', '/default/')] = abspath;
                    });
                }
                delete data.files[defaultTarget];
                return data;
            }
        }

        function findDefaultData(environment, platform) {
            var data = {
                files: {},
                options: {}
            };

            grunt.file.recurse('app/localized/default/stylesheets', function callback(abspath, rootdir, subdir, filename) {
                var parts = subdir.split('/');
                var target = 'public/css/default/' + parts[0] + '/styles';
                var helpers;

                if (parts[0] !== platform) {
                    return;
                }
                if (parts[1] && parts[1] === 'helpers') {
                    helpers = rootdir + '/' + parts[0];
                    data.options.paths = [helpers];
                    data.options.import = ['helpers'];
                    return false;
                }
                if (environment !== 'production') {
                    target += '-' + environment;
                }
                target += '.css';
                if (filename.split('.').pop() !== 'styl') {
                    return;
                }
                if (!data.files[target]) {
                    data.files[target] = {};
                }
                data.files[target][abspath] = abspath;
            });
            return data;
        }

        function prepareTask(data, options) {
            var key = [options.environment, options.platform, options.location].join('-');
            var files = data.files;
            var target;
            var file;

            stylus[key] = {
                files: {},
                options: _.defaults({}, data.options, {
                    paths: [],
                    import: [],
                    define: {
                        staticUrl: utils.get(stylusConfig, [options.environment, options.location, 'urls', 'static'], utils.get(stylusConfig, [options.environment, 'urls', 'static'], '')),
                        imageUrl: utils.get(stylusConfig, [options.environment, options.location, 'urls', 'image'], utils.get(stylusConfig, [options.environment, 'urls', 'image'], ''))
                    }
                })
            };

            for (target in files) {
                stylus[key].files[target] = [];
                for (file in files[target]) {
                    stylus[key].files[target].unshift(files[target][file]);
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
                stylus[key].options.define.staticUrl = utils.get(stylusConfig, [environment, 'urls', 'static'], '');
                stylus[key].options.define.imageUrl = utils.get(stylusConfig, [environment, 'urls', 'image'], '');
            }
            fileName.push('.css');
            fileName = fileName.join('');
            stylus[key].files[fileName] = fileName;
        }
    })();

    return stylus;
};