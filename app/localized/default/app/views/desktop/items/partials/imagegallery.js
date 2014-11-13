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

        var active = $('[data-gallery-thumb].active');
        var thumbwraper = $('[data-gallery-thumbwraper]');
        var activeNumber = active.data('gallery-thumb');
        var thumbsNumber = thumbwraper.data('gallery-thumbwraper');
        var thumbwraperPos = thumbwraper.position();
        var newPos;
        var thumbHeight = active.outerHeight();
        if (activeNumber > 4) {
            newPos = thumbwraperPos.top - thumbHeight;
            console.log(newPos);
            thumbwraper.animate({'top': newPos+'px'}, 100);
        }

        if ($(event.currentTarget).hasClass('arrow-prev')) {
            if (active.prev('[data-gallery-thumb]').length > 0) {
                active.prev().mouseover();
            } else {
                $('[data-gallery-thumb]').last().mouseover();
            }
        } else {
            if (active.next('[data-gallery-thumb]').length > 0) {
                active.next().mouseover();
            } else {
                $('[data-gallery-thumb]').first().mouseover();
            }
        }
    }
});

module.exports.id = 'items/partials/imagegallery';
