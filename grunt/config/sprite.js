'use strict';

module.exports = function(grunt) {
    var _ = require('underscore');
    var util = require('util');
    var iconsLocalization = require('../../app/config').get('icons');
    var sprites = {};

    (function spriteIcons() {
        var platforms = ['html5'];
        var defaultsSrc = 'app/icons/default/PLATFORM';
        var defaultsSrcLocalized = 'app/icons/LOCALIZATION/PLATFORM';
        var defaultsDestImg = 'public/images/PLATFORM/icons/LOCALIZATION/icons.png';
        var defaultsDestCSS = 'public/css/LOCALIZATION/PLATFORM/icons.css';
        var defaultsImgPath = 'imageUrl/images/PLATFORM/icons/LOCALIZATION/icons.png';
        var repLocation = 'LOCALIZATION';
        var repPlatform = 'PLATFORM';
        var defaults = {
            cssTemplate: 'app/icons/css.template.mustache',
            cssFormat: 'css'
        };
        var images = ['gif', 'png', 'ico', 'jpg', 'jpeg'];
        var platform;
        var defaultsIcons;

        for (platform in iconsLocalization) {
            if (!_.contains(platforms, platform)) {
                continue;
            }
            iconsLocalization[platform].forEach(addIconLocation);
        }

        function addIconLocation(location) {
            sprites[location] = _.extend({}, defaults, {
                src: findIconsSrcs(location, platform),
                destImg: defaultsDestImg.replace(repLocation, location).replace(repPlatform, platform),
                destCSS: defaultsDestCSS.replace(repLocation, location).replace(repPlatform, platform),
                imgPath: defaultsImgPath.replace(repLocation, location).replace(repPlatform, platform),
                cssOpts: {
                    functions: true,
                    defaults: {
                        country: location,
                        width: '32px',
                        height: '32px'
                    }
                }
            });
        }

        platforms.forEach(function(_platform) {
            platform = _platform;
            addIconLocation('default');
        });

        function findDefaultIconsSrcs(platform) {
            if (defaultsIcons) {
                return defaultsIcons;
            }
            var path = defaultsSrc.replace(repPlatform, platform);
            
            defaultsIcons = {};
            grunt.file.recurse(path, function callback(abspath, rootdir, subdir, filename) {
                if (!~images.indexOf(filename.split('.').pop())) {
                    return;
                }
                defaultsIcons[filename] = abspath;
            });
            return defaultsIcons;
        }

        function findIconsSrcs(location, platform) {
            var defaults = _.clone(findDefaultIconsSrcs(platform));
            var path = defaultsSrcLocalized.replace(repLocation, location).replace(repPlatform, platform);
            
            grunt.file.recurse(path, function callback(abspath, rootdir, subdir, filename) {
                if (!~images.indexOf(filename.split('.').pop())) {
                    return;
                }
                defaults[filename] = abspath;
            });
            return _.map(defaults, function(abspath, filename) { 
                return abspath; 
            });
        }
    })();

    return sprites;
};
