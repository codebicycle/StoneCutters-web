'use strict';

module.exports = function(grunt) {
//    var dynamic = ['app/**/*', '!app/config/default.js', 'server/**/*', 'index.js', 'build.json', 'newrelic.js', 'package.json', 'start.sh'];
/*    var dependencies = grunt.file.readJSON('package.json').dependencies;
    var path = require('path');
    var _ = require('underscore');
    var localization = require('../../server/config').get('localization');
    var iconsLocalization = require('../../app/config').get('icons');
    var icons = [];

    (function copyIcons() {
        var files = {};
        var platform;

        grunt.file.recurse('app/icons/default', function callback(abspath, rootdir, subdir, filename) {
            var dest = 'public/images/' + subdir + '/icons/default/' + filename;

            if (!(~['gif', 'png', 'ico', 'jpg', 'jpeg'].indexOf(filename.split('.').pop()))) {
                return;
            }
            files[dest] = {
                src: [abspath],
                dest: dest
            };
            for (var platform in iconsLocalization) {
                if (platform !== subdir) {
                    continue;
                }
                iconsLocalization[platform].forEach(eachIconLocation);
            }

            function eachIconLocation(location) {
                var localized = dest.replace('default', location);

                files[localized] = {
                    src: [abspath],
                    dest: localized
                };
            }
        });
        for (platform in iconsLocalization) {
            iconsLocalization[platform].forEach(eachIconLocation);
        }

        function eachIconLocation(location) {
            var dir = 'app/icons/' + location + '/' + platform;

            if (grunt.file.exists(dir)) {
                grunt.file.recurse(dir, function each(abspath, rootdir, subdir, filename) {
                    var dest = 'public/images/' + platform + '/icons/' + location + '/' + filename;

                    if (!(~['gif', 'png', 'ico', 'jpg', 'jpeg'].indexOf(filename.split('.').pop()))) {
                        return;
                    }
                    files[dest] = {
                        src: [abspath],
                        dest: dest
                    };
                });
            }
        }

        for (var icon in files) {
            icons.push(files[icon]);
        }
    })();
*/

    var all = {
        src: 'app/icons/www.olx.in/html5/*.png',
        destImg: 'public/images/html5/icons/www.olx.in/spriteIcons.png',
        destCSS: 'public/css/www.olx.in/html5/icons.css',
        imgPath: 'imageUrl/images/html5/icons/www.olx.in/spriteIcons.png',
        cssTemplate: 'public/css/default/html5/icons.styl.mustache',
        cssFormat: 'css',
        cssOpts: {
            functions: {},
            defaults: {
                country: 'www.olx.in',
                width: '32px',
                height: '32px'
            }
        }
    };

    return {
        all: all
    };
};
