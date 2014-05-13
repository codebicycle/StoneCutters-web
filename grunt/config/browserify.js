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
        var target = 'public/js/app/default/app.js';

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

    files['public/js/app/default/app.js']['app/templates/compiled/default/html5/templates.js'] = 'app/templates/compiled/default/html5/templates.js';

    for (platform in localization) {
        localization[platform].forEach(eachLocation);
    }
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
                external: ['jquery', 'nunjucks', '../translations']
            }
        };
        browserify[location].files[target] = [];
        for (file in files[target]) {
            browserify[location].files[target].unshift(files[target][file]);
            browserify[location].options.aliasMappings[0].src.push(files[target][file].slice(4));
        }
    }

    function eachLocation(location) {
        var dir = 'app/templates/compiled/' + location + '/' + platform;
        var defaultTarget = 'public/js/app/default/app.js';

        if(platform === 'wap' || platform === 'html4') {
            return;
        }
        target = 'public/js/app/' + location + '/app.js';
        if (!files[target]) {
            files[target] = _.clone(files[defaultTarget]);
        }
        if (grunt.file.exists(dir)) {
            grunt.file.recurse(dir, function each(abspath, rootdir, subdir, filename) {
                if (filename.split('.').pop() !== 'js') {
                    return;
                }
                files[target][abspath.replace('/' + location + '/', '/default/')] = abspath;
            });
        }
    }

    return browserify;
};
