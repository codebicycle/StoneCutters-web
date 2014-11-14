'use strict';

var Base = require('../../../../../../common/app/bases/view');

module.exports = Base.extend({
    className: 'image-gallery',
    id: 'image-gallery',
    events: {
        'mouseover [data-gallery-thumb]': 'updateGallery',
        'click [data-gallery-navigator] [class*="arrow-"]': 'navigate'
    },
    updateGallery: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if(!$(event.currentTarget).hasClass('active')) {
            var $image = $(event.currentTarget).find('img');
            var image = $image.data('image');
            var currentImage = $image.attr('src');
            var currentImageAlt = $image.attr('alt');
            var newImg = new Image();

            $('[data-gallery-thumb]').removeClass('active');
            $(event.currentTarget).addClass('active');
            $('[data-gallery-image]').attr('src', '').attr('alt', '').addClass('spinner');

            newImg.src = image;
            newImg.onload = function() {
                $('[data-gallery-image]').removeClass('spinner').attr('src', image).attr('alt', currentImageAlt);
            };
        }
    },
    navigate: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var visibleThumbs = 5;
        var active = $('[data-gallery-thumb].active');
        var thumbwraper = $('[data-gallery-thumbwraper]');
        var activeNumber = active.data('gallery-thumb');
        var thumbsNumber = thumbwraper.data('gallery-thumbwraper');
        var thumbwraperPos = thumbwraper.position().top;
        var enoughThumbs = thumbsNumber > visibleThumbs;
        var newPos;
        var thumbHeight = active.outerHeight(true);
        var thumbsLast = thumbHeight * (thumbsNumber - visibleThumbs);
        var maxTopPosition = -(thumbsNumber - visibleThumbs) * thumbHeight;

        if ($(event.currentTarget).hasClass('arrow-prev')) {
            if (activeNumber > 1) {
                active.prev().mouseover();
                if (activeNumber < (visibleThumbs + 1) & thumbwraperPos !== 0 & enoughThumbs) {
                    newPos = thumbwraperPos + thumbHeight;
                    thumbwraper.animate({'top': newPos+'px'}, 100);
                }
            } 
            else {
                $('[data-gallery-thumb]').last().mouseover();
                thumbwraper.animate({'top': '-'+thumbsLast+'px'}, 500);
            }
        } 
        else {
            if (activeNumber < thumbsNumber) {
                if (activeNumber > (visibleThumbs - 1) & thumbwraperPos !== maxTopPosition & enoughThumbs) {
                    newPos = thumbwraperPos - thumbHeight;
                    thumbwraper.animate({'top': newPos+'px'}, 100);
                }
                active.next().mouseover();
            } 
            else {
                $('[data-gallery-thumb]').first().mouseover();
                thumbwraper.animate({'top': '0'}, 500);
            }
        }
    }
});

module.exports.id = 'items/partials/imagegallery';
