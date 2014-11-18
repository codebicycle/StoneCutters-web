'use strict';

var Base = require('../../../../../../common/app/bases/view');
var _ = require('underscore');
var Seo = require('../../../../../../../modules/seo');

module.exports = Base.extend({
    className: 'image-gallery',
    id: 'image-gallery',
    events: {
        'mouseover [data-gallery-thumb]': 'updateGallery',
        'click [data-gallery-navigator] [class*="arrow-"]': 'navigate'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var seo = Seo.instance(this.app);
        var images = data.item.images;
        var altImages = seo.get('altImages');
        var imgPlusAlts = [];
        var cantImages = images.length;
        var cantAlt = altImages.length;

        var alts = 0;
        for(var i = 0; i < images.length; i++) {
            if (!altImages[alts]) {
                alts = 0;
            }
            imgPlusAlts.push({
                'url': images[i].url,
                'alt': altImages[alts]
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
        var thumbwrapper = $('[data-gallery-thumbwrapper]');
        var activeNumber = active.data('gallery-thumb');
        var thumbsNumber = thumbwrapper.data('gallery-thumbwrapper');
        var thumbwrapperPos = thumbwrapper.position().top;
        var enoughThumbs = thumbsNumber > visibleThumbs;
        var thumbHeight = active.outerHeight(true);
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
    }
});

module.exports.id = 'items/partials/imagegallery';
