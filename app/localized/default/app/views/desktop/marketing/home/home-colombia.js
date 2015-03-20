'use strict';

var Base = require('../../../../../../common/app/bases/view').requireView('marketing/home/home-colombia');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'section',
    id: 'olx-banner-col',
    className: 'olx-banner-col',
    postRender: function() {
        $('#slider-olx-colombia').royalSlider({
            arrowsNav: true,
            arrowsNavAutoHide: false,
            fadeinLoadedSlide: false,
            controlNavigationSpacing: 0,
            controlNavigation: 'bullets',
            imageScaleMode: 'none',
            imageAlignCenter:false,
            blockLoop: true,
            loop: true,
            numImagesToPreload: 6,
            transitionType: 'fade',
            keyboardNavEnabled: true,
            block: {
                delay: 400
            },
            autoPlay: {
                enabled: true,
                pauseOnHover: true,
                delay: 8000
            }
        });
    }
});

module.exports.id = 'marketing/home/home-colombia';
