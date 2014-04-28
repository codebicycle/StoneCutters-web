'use strict';

module.exports = function(grunt) {
    var path = require('path');
    var _ = require('underscore');
    var localization = require('../server/config').get('localization');
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
    rendrNunjucks.registerExtensions(require('../app/helpers').nunjucks.extensions);
    nunjucks.options.env = rendrNunjucks.nunjucks;

    grunt.file.recurse('app/templates/default', function callback(abspath, rootdir, subdir, filename) {
        var parts = subdir.split('/');
        var src = 'app/templates/compiled/default/' + subdir + '/' + filename;
        var dest = 'app/templates/compiled/default/' + parts[0] + '/templates.js';

        if (filename.split('.').pop() !== 'html') {
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
        var dir = 'app/templates/' + location + '/' + platform;

        if (grunt.file.exists(dir)) {
            grunt.file.recurse(dir, function each(abspath, rootdir, subdir, filename) {
                var parts = subdir.split('/');
                var defaultSrc = 'app/templates/compiled/default/' + platform + '/' + subdir + '/' + filename;
                var src = 'app/templates/compiled/' + location + '/' + platform + '/' + subdir + '/' + filename;
                var dest = 'app/templates/compiled/' + location + '/' + platform + '/templates.js';

                if (filename.split('.').pop() !== 'html') {
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
