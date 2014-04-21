'use strict';

module.exports = function(grunt) {
    var _ = require('underscore');
    var localizedTemplates = require('../server/localizedTemplates');
    var stylus = {
        options: {
            'include css': true
        },
        compile: {
            files: {}
        }
    };
    var files = {};
    var file;
    var platform;

    grunt.file.recurse('app/stylesheets/default', function callback(abspath, rootdir, subdir, filename) {
        var parts = subdir.split('/');
        var target = 'public/css/default/' + parts[0] + '/styles.css';

        if (filename.split('.').pop() === 'styl') {
            if (!files[target]) {
                files[target] = {};
            }
            files[target][abspath] = abspath;
        }
    });

    for (platform in localizedTemplates) {
        localizedTemplates[platform].forEach(eachLocation);
    }
    for (var target in files) {
        stylus.compile.files[target] = [];
        for (file in files[target]) {
            stylus.compile.files[target].unshift(files[target][file]);
        }
    }

    function eachLocation(location) {
        var dir = 'app/stylesheets/' + location + '/' + platform;
        var defaultTarget = 'public/css/default/' + platform + '/styles.css';

        target = 'public/css/' + location + '/' + platform + '/styles.css';
        if (!files[target]) {
            files[target] = _.clone(files[defaultTarget]);
        }
        if (grunt.file.exists(dir)) {
            grunt.file.recurse(dir, function each(abspath, rootdir, subdir, filename) {
                files[target][abspath.replace('/' + location + '/', '/default/')] = abspath;
            });
        }
    }

    return stylus;
};
