'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('users/userprofile');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'main',
    className: 'users-userprofile-view',
    events: {
        'click [data-navigate]': 'navigate'
    },
    postRender: function() {
        var $slide = $('.user-ads ul li');
        var slideWrapperWidth = $slide.outerWidth() * $slide.length;
        $('.user-ads ul').width(slideWrapperWidth);
    },
    navigate: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $current = $(event.currentTarget);
        var direction = $current.data('navigate');
        var $slideWrapper = $('[data-items-slide]');
        var $slide = $('.user-ads ul li');
        var slideWidth = $slide.outerWidth();
        var slideWrapperPos = $slideWrapper.position().left;
        var slideLength = $slide.length;
        var maxLeftPosition = -(slideLength - 6) * slideWidth;
        var pxToMove = 0;

        if(direction == 'right' && slideWrapperPos !== maxLeftPosition) {
            pxToMove = slideWrapperPos - slideWidth;
        }
        else if(direction == 'left' && slideWrapperPos !== 0) {
            pxToMove = slideWrapperPos + slideWidth;
        }
        else if(slideWrapperPos === 0) {
            pxToMove = maxLeftPosition;
        }

        $slideWrapper.animate({
            'left': pxToMove + 'px'
        }, 100);
    }
});
