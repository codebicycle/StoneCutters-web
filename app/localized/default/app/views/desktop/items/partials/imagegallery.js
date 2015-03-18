'use strict';

var Base = require('../../../../../../common/app/bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'image-gallery',
    id: 'image-gallery',
    events: {
        'mouseover [data-gallery-thumb]': 'updateGallery',
        'click [data-gallery-navigator] [class*="arrow-"]': 'navigate',
        'click [data-modal-close]': 'onCloseModal',
        'click .open-modal': 'onOpenModal',
        'click [data-modal-shadow]': 'onCloseModal'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var images = data.item.images;
        var altImages = this.app.seo.get('altImages') || [];
        var imgPlusAlts = [];
        var cantImages = images.length;
        var cantAlt = altImages.length;
        var alts = 0;
        var i;

        for(i = 0; i < images.length; i++) {
            if (!altImages[alts]) {
                alts = 0;
            }
            imgPlusAlts.push({
                url: images[i].url,
                alt: altImages[alts]
            });
            alts++;
        }

        return _.extend({}, data, {
            imgPlusAlts: imgPlusAlts
        });
    },
    updateGallery: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $elem = $(event.currentTarget);
        var $image;
        var $galleryImage;
        var newImage;
        var image;
        var alt;

        if(!$elem.hasClass('active')) {
            $image = $elem.find('img');
            $galleryImage = $('[data-gallery-image]');
            image = $image.data('image');
            alt = $image.attr('alt');
            newImage = new Image();

            $('[data-gallery-thumb]').removeClass('active');
            $elem.addClass('active');
            $('[data-gallery-image]').attr('src', '').attr('alt', '').addClass('spinner');

            newImage.src = image;
            newImage.onload = function() {
                $galleryImage.removeClass('spinner').attr('src', image).attr('alt', alt);
            };
        }
    },
    navigate: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var visibleThumbs = 5;
        var active = $('[data-gallery-thumb].active');
        var thumbwrapper = $('[data-gallery-thumbwrapper]');
        var activeNumber = active.data('gallery-thumb');
        var thumbsNumber = thumbwrapper.data('gallery-thumbwrapper');
        var thumbwrapperPos = thumbwrapper.position().top;
        var enoughThumbs = thumbsNumber > visibleThumbs;
        var thumbHeight = active.outerHeight(true) + 3;
        var thumbsLast = thumbHeight * (thumbsNumber - visibleThumbs);
        var maxTopPosition = -(thumbsNumber - visibleThumbs) * thumbHeight;
        var newPos;

        if ($(event.currentTarget).hasClass('arrow-prev')) {
            if (activeNumber > 1) {
                active.prev().mouseover();
                if (activeNumber < (visibleThumbs + 1) && thumbwrapperPos !== 0 && enoughThumbs) {
                    newPos = thumbwrapperPos + thumbHeight;
                    thumbwrapper.animate({
                        'top': newPos + 'px'
                    }, 100);
                }
            }
            else {
                $('[data-gallery-thumb]').last().mouseover();
                thumbwrapper.animate({
                    'top': '-' + thumbsLast + 'px'
                }, 500);
            }
        }
        else {
            if (activeNumber < thumbsNumber) {
                if (activeNumber > (visibleThumbs - 1) && thumbwrapperPos !== maxTopPosition && enoughThumbs) {
                    newPos = thumbwrapperPos - thumbHeight;
                    thumbwrapper.animate({
                        'top': newPos + 'px'
                    }, 100);
                }
                active.next().mouseover();
            }
            else {
                $('[data-gallery-thumb]').first().mouseover();
                thumbwrapper.animate({
                    'top': '0'
                }, 500);
            }
        }
    },
    onOpenModal: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $image = $('[data-gallery-thumb].active');
        var args;

        if ($image.length) {
            args = [$image.data('gallery-thumb')];
        }
        $('#modal-image-gallery').trigger('show', args);
    },
    onCloseModal: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        $('#modal-image-gallery').trigger('hide');
    }
});

module.exports.id = 'items/partials/imagegallery';
