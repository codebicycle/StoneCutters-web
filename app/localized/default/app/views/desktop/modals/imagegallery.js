'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('modals/modal', null, 'desktop');

module.exports = Base.extend({
    id: 'modal-image-gallery',
    idModal: 'image-gallery-modal',
    events: _.extend({}, Base.prototype.events, {
        'mouseover [data-modal-gallery-thumb]': 'updateGallery',
        'click [data-modal-gallery-navigator]': 'onNavigate',
        'mouseenter [data-modal=image-gallery-modal] .modal-container': 'onShowTools',
        'mouseleave [data-modal=image-gallery-modal] .modal-container': 'onHideTools'
    }),
    updateGallery: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $elem = $(event.currentTarget);

        if(!$elem.hasClass('active')) {
            this.showImage($elem);
        }
    },
    onNavigate: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $elem = $(event.currentTarget);
        var active = $('[data-modal-gallery-thumb].active');
        var thumbwrapper = $('[data-modal-gallery-thumbwrapper]');
        var activeNumber = active.data('modal-gallery-thumb');
        var thumbsNumber = thumbwrapper.data('modal-gallery-thumbwrapper');
        var $thumb = $('[data-modal-gallery-thumb]');

        if ($elem.hasClass('arrow-prev')) {
            if (activeNumber > 1) {
                active.prev().mouseover();
            }
            else {
                $thumb.last().mouseover();
            }
        }
        else {
            if (activeNumber < thumbsNumber) {
                active.next().mouseover();
            }
            else {
                $thumb.first().mouseover();
            }
        }
    },
    onShowTools: function(event) {
        this.$('[data-modal-close]').stop(true, true).fadeIn(500);
        this.$('[data-modal-gallery-navigator]').stop(true, true).fadeIn(500);
        this.$('.modal-footer').stop(true, true).slideDown(500);
    },
    onHideTools: function(event) {
        this.$('[data-modal-close]').stop(true, true).fadeOut(500);
        this.$('[data-modal-gallery-navigator]').stop(true, true).fadeOut(500);
        this.$('.modal-footer').stop(true, true).slideUp(500);
    },
    onShow: function(event, thumb) {
        var $elem;

        Base.prototype.onShow.apply(this, arguments);

        if (thumb !== undefined) {
            $elem = $('[data-modal-gallery-thumb=' + thumb + ']');
            if(!$elem.hasClass('active')) {
                this.showImage($elem);
            }
        }
    },
    showImage: function($elem) {
        var $image = $elem.find('img');
        var $galleryImage = $('[data-modal-gallery-image]');
        var image = $image.data('modal-image');
        var alt = $image.attr('alt');
        var newImage = new Image();

        $('[data-modal-gallery-thumb]').removeClass('active');
        $elem.addClass('active');
        $galleryImage.attr('src', '').attr('alt', '').addClass('spinner');

        newImage.src = image;
        newImage.onload = function() {
            $galleryImage.removeClass('spinner').attr('src', image).attr('alt', alt);
        };
    }
});

module.exports.id = 'modals/imagegallery';
