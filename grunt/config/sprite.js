'use strict';

module.exports = function(grunt) {
    var _ = require('underscore');
    var util = require('util');
    var iconsLocalization = require('../../app/config').get('icons');
    var sprites = {};

    (function spriteIcons() {
        var defaultsSrc = 'app/icons/default/PLATFORM/*.png';
        var defaultsSrcLocalized = 'app/icons/LOCALIZATION/PLATFORM/*.png';
        var defaultsDestImg = 'public/images/PLATFORM/icons/LOCALIZATION/icons.png';
        var defaultsDestCSS = 'public/css/LOCALIZATION/PLATFORM/icons.css';
        var defaultsImgPath = 'imageUrl/images/PLATFORM/icons/LOCALIZATION/icons.png';
        var repLocation = 'LOCALIZATION';
        var repPlatform = 'PLATFORM';
        var defaults = {
            cssTemplate: 'app/icons/css.template.mustache',
            cssFormat: 'css'
        };
        var platform;

        for (platform in iconsLocalization) {
            if (platform !== 'html5') {
                continue;
            }
            iconsLocalization[platform].forEach(addIconLocation);
        }

        function addIconLocation(location) {
            sprites[location] = _.extend({}, defaults, {
                src: [defaultsSrc.replace(repPlatform, platform), defaultsSrcLocalized.replace(repLocation, location).replace(repPlatform, platform)],
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

        platform = 'html5';
        addIconLocation('default');
    })();

    return sprites;
};
