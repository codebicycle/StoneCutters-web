'use strict';

module.exports = function(grunt) {
    var _ = require('underscore');
    var localization = require('../../app/config').get('localization');
    var browserify = {
        lib: {
            src: ['public/js/lib/**/*.js'],
            dest: 'public/js/src/common/libs.js',
            options: {
                alias: ['node_modules/rendr-nunjucks/index.js:rendr-nunjucks', 'node_modules/nunjucks/browser/nunjucks-slim.js:nunjucks', 'public/js/lib/jquery.js:jquery', 'node_modules/sixpack-client/sixpack.js:sixpack-client'],
                external: ['underscore', 'url', 'querystring']
            }
        },
        translations: {
            src: ['app/translations/**/*.js'],
            dest: 'public/js/src/common/translations.js',
            options: {
                alias: ['app/translations/index.js:../app/translations']
            }
        },
        config: {
            src: ['app/config/**/*.js'],
            dest: 'public/js/src/common/config-development.js',
            options: {
                alias: [],
                external: ['underscore', '../../shared/utils']
            }
        },
        'flags-testing': {
            src: ['dist/git/app/config/**/*.js'],
            dest: 'public/js/src/common/config-testing.js',
            options: {
                alias: ['app/config/index.js:../app/config'],
                external: ['underscore', './default', '../../shared/utils'],
                exclude: ['../app/config/default']
            }
        },
        'flags-production': {
            src: ['dist/git/app/config/**/*.js'],
            dest: 'public/js/src/common/config.js',
            options: {
                alias: ['app/config/index.js:../app/config'],
                external: ['underscore', './default', '../../shared/utils'],
                exclude: ['../app/config/default']
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
                external: [
                    'EXIF',
                    'jquery',
                    'nunjucks',
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
