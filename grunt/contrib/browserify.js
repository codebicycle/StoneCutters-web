'use strict';

module.exports = function(grunt) {
    var _ = require('underscore');
    var localization = require('../config').get('localization');
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
        },
        'config-development': {
            src: ['app/config/**/*.js', '!app/config/default-testing.js', '!app/config/default-staging.js', '!app/config/default.js'],
            dest: 'public/js/src/common/config-development.js',
            options: {
                alias: ['app/config/index.js:../app/config', 'app/config/default-development.js:./default', 'shared/utils.js:../../shared/utils'],
                external: ['underscore', 'querystring']
            }
        },
        'config-testing': {
            src: ['app/config/**/*.js', '!app/config/default-development.js', '!app/config/default-staging.js', '!app/config/default.js'],
            dest: 'public/js/src/common/config-testing.js',
            options: {
                alias: ['app/config/index.js:../app/config', 'app/config/default-testing.js:./default', 'shared/utils.js:../../shared/utils'],
                external: ['underscore', 'querystring']
            }
        },
        'config-staging': {
            src: ['app/config/**/*.js', '!app/config/default-development.js', '!app/config/default-testing.js', '!app/config/default.js'],
            dest: 'public/js/src/common/config-staging.js',
            options: {
                alias: ['app/config/index.js:../app/config', 'app/config/default-staging.js:./default', 'shared/utils.js:../../shared/utils'],
                external: ['underscore', 'querystring']
            }
        },
        config: {
            src: ['app/config/**/*.js', '!app/config/default-development.js', '!app/config/default-testing.js', '!app/config/default-staging.js'],
            dest: 'public/js/src/common/config.js',
            options: {
                alias: ['app/config/index.js:../app/config', 'app/config/default.js:./default', 'shared/utils.js:../../shared/utils'],
                external: ['underscore', 'querystring']
            }
        }
    };

    compile('default');
    for (var platform in localization) {
        if (platform !== 'html5') {
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
