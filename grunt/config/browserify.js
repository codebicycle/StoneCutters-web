'use strict';

module.exports = function(grunt) {
    var _ = require('underscore');
    var localization = require('../../server/config').get('localization');
    var browserify = {
        lib: {
            src: ['public/js/lib/**/*.js'],
            dest: 'public/js/app/libs.js',
            options: {
                alias: ['node_modules/rendr-nunjucks/index.js:rendr-nunjucks', 'node_modules/nunjucks/browser/nunjucks-slim.js:nunjucks', 'public/js/lib/jquery.js:jquery', 'node_modules/sixpack-client/sixpack.js:sixpack-client']
            }
        },
        translations: {
            src: ['app/translations/**/*.js'],
            dest: 'public/js/app/translations.js',
            options: {
                alias: ['app/translations/index.js:../translations']
            }
        }
    };
    var files = {};
    var file;
    var platform;
    var location;

    grunt.file.recurse('app', function callback(abspath, rootdir, subdir, filename) {
        var parts = [];
        var target = 'public/js/app/app.js';

        if (subdir) {
            parts = subdir.split('/');
        }
        if (parts[0] === 'templates' || parts[0] === 'stylesheets' || parts[0] === 'translations' || filename.split('.').pop() !== 'js') {
            return;
        }
        if (!files[target]) {
            files[target] = {};
        }
        files[target][abspath] = abspath;
    });

    for (var target in files) {
        location = target.split('/')[3];
        browserify[location] = {
            files: {},
            options: {
                aliasMappings: [{
                    cwd: 'app/',
                    src: [],
                    dest: 'app/'
                }],
                external: ['jquery', 'nunjucks', '../translations', 'EXIF']
            }
        };
        browserify[location].files[target] = [];
        for (file in files[target]) {
            browserify[location].files[target].unshift(files[target][file]);
            browserify[location].options.aliasMappings[0].src.push(files[target][file].slice(4));
        }
    }

    return browserify;
};
