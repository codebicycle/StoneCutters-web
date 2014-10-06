'use strict';

module.exports = function(grunt) {
    var _ = require('underscore');
    var config = require('../config');
    var utils = require('../utils');
    var localization = config.get('localization');
    var browserify = {
        lib: {
            src: ['public/js/lib/**/*.js'],
            dest: 'public/js/src/common/libs.js',
            options: {
                alias: ['node_modules/rendr-nunjucks/index.js:rendr-nunjucks', 'node_modules/nunjucks/browser/nunjucks-slim.js:nunjucks', 'public/js/lib/jquery.js:jquery', 'node_modules/sixpack-client/sixpack.js:sixpack-client', 'node_modules/underscore/underscore.js:underscore'],
                external: ['url', 'querystring']
            }
        },
        translations: {
            src: ['app/translations/**/*.js'],
            dest: 'public/js/src/common/translations.js',
            options: {
                alias: ['app/translations/index.js:../app/translations']
            }
        }
    };

    (function browserifyConfig() {
        var environments = utils.getEnvironments(grunt);
        var allEnvironments = ['development', 'testing', 'staging', 'production'];
        var defaultSrc = ['app/config/**/*.js'];
        var defaultOptionAlias = ['app/config/index.js:../app/config', 'shared/utils.js:../../shared/utils'];
        var defaultOptionExternal = ['underscore', 'querystring'];

        var srcTemplate = '!app/config/defaultENVIRONMENT.js';
        var aliasTemplate = 'app/config/defaultENVIRONMENT.js:./default';
        var destTemplate = 'public/js/src/common/configENVIRONMENT.js';
        var nameTemplate = 'configENVIRONMENT';
        var repEnvironment = 'ENVIRONMENT';

        environments.forEach(function(environment) {
            var browserifyConfig = {};

            browserifyConfig.src = getSrc(environment);
            browserifyConfig.dest = replace(destTemplate, environment);
            browserifyConfig.options = {
                alias: _.clone(defaultOptionAlias),
                external: defaultOptionExternal
            };
            browserifyConfig.options.alias.push(replace(aliasTemplate, environment));
            browserify[replace(nameTemplate, environment)] = browserifyConfig;

        });

        function getSrc(env) {
            var srcs = [];

            allEnvironments.forEach(function(environment) {
                if (env === environment) {
                    return;
                }
                srcs.push(replace(srcTemplate, environment));
            });
            return _.clone(defaultSrc).concat(srcs);
        }

        function replace(key, environment) {
            if (environment === 'production') {
                return key.replace(repEnvironment, '');
            }
            return key.replace(repEnvironment, '-' + environment);
        }
    })();

    compile('default');
    for (var platform in localization) {
        if (platform === 'wap' || platform === 'html4') {
            continue;
        }
        localization[platform].forEach(compile);
    }

    function compile(location) {
        var target = 'public/js/src/' + location + '/app.js';

        browserify[target] = {
            files: {},
            options: {
                aliasMappings: [{
                    cwd: 'app/',
                    dest: 'app/'
                }],
                alias: [],
                external: [
                    'EXIF',
                    'jquery',
                    'nunjucks',
                    'underscore',
                    '../app/translations',
                    '../app/config'
                ]
            }
        };
        browserify[target].files[target] = [];

        grunt.file.recurse('app', function callback(abspath, rootdir, subdir, filename) {
            var parts = [];

            if (subdir) {
                parts = subdir.split('/');
            }
            if ((parts[0] === 'localized' && parts[1] && parts[1] !== 'common' && parts[1] !== 'default' && parts[1] !== location) || parts[0] === 'translations' || parts[0] === 'config' || filename.split('.').pop() !== 'js') {
                return;
            }
            browserify[target].files[target].unshift(abspath);
        });

        browserify[target].options.aliasMappings[0].src = browserify[target].files[target].map(function map(file) {
            return file.slice(4);
        });
    }

    return browserify;
};
