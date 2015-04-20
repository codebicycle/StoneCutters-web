'use strict';

module.exports = function(grunt) {
    var _ = require('underscore');
    var util = require('util');
    var crypto = require('crypto');
    var config = require('../config');
    var utils = require('../utils');
    var environments = utils.getEnvironments(grunt);
    var sprites = {};

    (function spriteIcons() {
        var version = crypto.createHash('md5').update(_.now().toString()).digest('hex').substr(24, 32);
        var filename = 'icons-' + version + '.png';
        var platforms = ['html5'];
        var defaultsSrc = 'app/localized/default/icons/PLATFORM';
        var defaultsSrcLocalized = 'app/localized/LOCALIZATION/icons/PLATFORM';
        var defaultsDestImg = 'public/images/PLATFORM/icons/LOCALIZATION/' + filename;
        var defaultsDestCSS = 'public/css/LOCALIZATION/PLATFORM/icons.css';
        var defaultsImgPath = 'imageUrl/images/PLATFORM/icons/LOCALIZATION/' + filename;
        var repLocation = 'LOCALIZATION';
        var repPlatform = 'PLATFORM';
        var defaults = {
            cssTemplate: 'grunt/templates/css.template.mustache',
            cssFormat: 'css'
        };
        var images = ['gif', 'png', 'ico', 'jpg', 'jpeg'];
        var defaultsIcons;

        environments.forEach(function(environment) {
            var icons = config.get('icons', {}, environment);
            var platform;

            for (platform in icons) {
                if (!_.contains(platforms, platform)) {
                    continue;
                }
                icons[platform].forEach(addIconLocation.bind(null, platform));
            }
        });

        function addIconLocation(platform, location) {
            var src = findIconsSrcs(location, platform);

            if (!src) {
                return;
            }
            sprites[location] = _.extend({}, defaults, {
                src: src,
                destImg: defaultsDestImg.replace(repLocation, location).replace(repPlatform, platform),
                destCSS: defaultsDestCSS.replace(repLocation, location).replace(repPlatform, platform),
                imgPath: defaultsImgPath.replace(repLocation, location).replace(repPlatform, platform),
                cssOpts: {
                    functions: true,
                    defaults: {
                        country: location,
                        version: version,
                        width: '32px',
                        height: '32px'
                    }
                }
            });
        }

        platforms.forEach(function(platform) {
            addIconLocation(platform, 'default');
        });

        function findDefaultIconsSrcs(platform) {
            if (defaultsIcons) {
                return defaultsIcons;
            }
            var dir = defaultsSrc.replace(repPlatform, platform);

            defaultsIcons = {};
            grunt.file.recurse(dir, function callback(abspath, rootdir, subdir, filename) {
                if (!~images.indexOf(filename.split('.').pop())) {
                    return;
                }
                defaultsIcons[filename] = abspath;
            });
            return defaultsIcons;
        }

        function findIconsSrcs(location, platform) {
            var defaults = _.clone(findDefaultIconsSrcs(platform));
            var dir = defaultsSrcLocalized.replace(repLocation, location).replace(repPlatform, platform);

            if (grunt.file.exists(dir)) {
                grunt.file.recurse(dir, function callback(abspath, rootdir, subdir, filename) {
                    if (!~images.indexOf(filename.split('.').pop())) {
                        return;
                    }
                    defaults[filename] = abspath;
                });
                return _.map(defaults, function(abspath, filename) {
                    return abspath;
                });
            }
        }
    })();

    return sprites;
};
