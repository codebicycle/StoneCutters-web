'use strict';

module.exports = function(grunt) {
    var path = require('path');
    var _ = require('underscore');
    var localization = require('../../app/config').get('localization');
    var rendrNunjucks = require('rendr-nunjucks')();
    var nunjucks = {
        options: {
            asFunction: true,
            name: name
        }
    };
    var files = {};
    var file;
    var platform;
    var srcs = {};

    function filter(filename) {
        filename = path.basename(filename);
        return filename.slice(0, 2) !== '__';
    }

    function name(filename) {
        return filename.replace('app/templates/', '');
    }

    rendrNunjucks.init();
    rendrNunjucks.registerExtensions(require('../../app/nunjucks').extensions);
    nunjucks.options.env = rendrNunjucks.nunjucks;

    grunt.file.recurse('app/localized/default/templates', function callback(abspath, rootdir, subdir, filename) {
        var parts = subdir ? subdir.split('/') : [];
        var src = 'app/templates/default/' + (subdir ? subdir + '/' : '') + filename;
        var dest = 'public/js/src/default/templates/' + parts[0] + '/templates.js';

        if (parts[0] === 'wap' || parts[0] === 'html4' || filename.split('.').pop() !== 'html') {
            return;
        }
        if (!srcs[dest]) {
            srcs[dest] = {};
        }
        srcs[dest][src] = src;
        for (var platform in localization) {
            if (platform !== parts[0]) {
                continue;
            }
            localization[platform].forEach(eachLocation);
        }

        function eachLocation(location) {
            var localized = dest.replace('default', location);

            if (!srcs[localized]) {
                srcs[localized] = {};
            }
            srcs[localized][src] = src.replace('default', location);
        }
    });
    for (platform in localization) {
        localization[platform].forEach(eachLocation);
    }

    function eachLocation(location) {
        var dir = 'app/localized/' + location + '/templates/' + platform;

        if (grunt.file.exists(dir)) {
            grunt.file.recurse(dir, function each(abspath, rootdir, subdir, filename) {
                var parts = subdir.split('/');
                var defaultSrc = 'app/templates/default/' + platform + '/' + subdir + '/' + filename;
                var src = 'app/templates/' + location + '/' + platform + '/' + subdir + '/' + filename;
                var dest = 'public/js/src/' + location + '/templates/' + platform + '/templates.js';

                if (platform === 'wap' || platform === 'html4' || filename.split('.').pop() !== 'html') {
                    return;
                }
                if (!srcs[dest]) {
                    srcs[dest] = {};
                }
                srcs[dest][defaultSrc] = src;
            });
        }
    }

    for (var dest in srcs) {
        if (!nunjucks[dest]) {
            nunjucks[dest] = {
                files: {},
                filter: filter
            };
        }
        if (!nunjucks[dest].files[dest]) {
            nunjucks[dest].files[dest] = [];
        }
        for (var src in srcs[dest]) {
            nunjucks[dest].files[dest].push(srcs[dest][src]);
        }
    }

    return nunjucks;
};
