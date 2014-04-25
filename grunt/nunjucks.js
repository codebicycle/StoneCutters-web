'use strict';

module.exports = function(grunt) {
    var path = require('path');
    var _ = require('underscore');
    var localization = require('../server/config').get('localization');
    var rendrNunjucks = require('rendr-nunjucks')();
    var nunjucks = {
        precompile: {
            files: {},
            filter: filter
        },
        options: {
            asFunction: true,
            name: name
        }
    };
    var files = {};
    var file;
    var platform;

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
        var target = 'app/templates/compiled/default/' + parts[0] + '/templates.js';

        if (filename.split('.').pop() !== 'html') {
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
        nunjucks.precompile.files[target] = [];
        for (file in files[target]) {
            nunjucks.precompile.files[target].unshift(files[target][file]);
        }
    }

    function eachLocation(location) {
        var dir = 'app/templates/' + location + '/' + platform;
        var defaultTarget = 'app/templates/compiled/default/' + platform + '/templates.js';

        target = 'app/templates/compiled/' + location + '/' + platform + '/templates.js';
        if (!files[target]) {
            files[target] = _.clone(files[defaultTarget]);
        }
        if (grunt.file.exists(dir)) {
            grunt.file.recurse(dir, function each(abspath, rootdir, subdir, filename) {
                if (filename.split('.').pop() !== 'html') {
                    return;
                }
                files[target][abspath.replace('/' + location + '/', '/default/')] = abspath;
            });
        }
    }

    return nunjucks;
};
