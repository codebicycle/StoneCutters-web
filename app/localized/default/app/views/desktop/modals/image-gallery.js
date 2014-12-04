'use strict';

var Base = require('../../../../../common/app/bases/view');

module.exports = Base.extend({
    className: 'modal-image-gallery',
    id: 'modal-image-gallery',
    events: {
        'mouseover [data-modal-gallery-thumb]': 'updateGallery',
        'click [data-modal-gallery-navigator]': 'navigate',
        'mouseenter [data-modal = image-modal] .modal-container': 'showTools',
        'mouseleave [data-modal = image-modal] .modal-container': 'hideTools'
    },
    updateGallery: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if(!$(event.currentTarget).hasClass('active')) {
            var $image = $(event.currentTarget).find('img');
            var image = $image.data('modal-image');
            var currentImage = $image.attr('src');
            var currentImageAlt = $image.attr('alt');
            var newImg = new Image();

            $('[data-modal-gallery-thumb]').removeClass('active');
            $(event.currentTarget).addClass('active');
            $('[data-modal-gallery-image]').attr('src', '').attr('alt', '').addClass('spinner');

            newImg.src = image;
            newImg.onload = function() {
                $('[data-modal-gallery-image]').removeClass('spinner').attr('src', image).attr('alt', currentImageAlt);
            };
        }
    },
    navigate: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var active = $('[data-modal-gallery-thumb].active');
        var thumbwrapper = $('[data-modal-gallery-thumbwrapper]');
        var activeNumber = active.data('modal-gallery-thumb');
        var thumbsNumber = thumbwrapper.data('modal-gallery-thumbwrapper');

        if ($(event.currentTarget).hasClass('arrow-prev')) {
            if (activeNumber > 1) {
                active.prev().mouseover();
            }
            else {
                $('[data-modal-gallery-thumb]').last().mouseover();
            }
        }
        else {
            if (activeNumber < thumbsNumber) {
                active.next().mouseover();
            }
            else {
                $('[data-modal-gallery-thumb]').first().mouseover();
            }
        }
    },
    showTools: function(event) {
        this.$('[data-modal-close]').stop(true, true).fadeIn(500);
        this.$('[data-modal-gallery-navigator]').stop(true, true).fadeIn(500);
        this.$('.modal-footer').stop(true, true).slideDown(500);
    },
    hideTools: function(event) {
        this.$('[data-modal-close]').stop(true, true).fadeOut(500);
        this.$('[data-modal-gallery-navigator]').stop(true, true).fadeOut(500);
        this.$('.modal-footer').stop(true, true).slideUp(500);
    }
});

module.exports.id = 'modals/image-gallery';
