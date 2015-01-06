'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('modals/modal');
var _ = require('underscore');

module.exports = Base.extend({
    idModal: 'base-modal',
    events: {
        'show': 'onShow',
        'hide': 'onHide',
        'click [data-video-item]': 'changeVideo'

    },
    onShow: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        $('body').addClass('noscroll');
        $('#' + this.idModal).addClass('modal-visible');
    },
    onHide: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        $('body').removeClass('noscroll');
        $('#' + this.idModal).removeClass('modal-visible');
    },
    changeVideo: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $target = $(event.currentTarget);

        if (!$target.hasClass('active')) {
            var videoId = $target.data('video-item');
            var videoUrl = "http://www.youtube.com/embed/" + videoId;
            var videoTitle = $target.find('.video-title').text();
            var $videosList = $('.video[data-video-item]');

            $videosList.removeClass('active');
            $target.addClass('active');

            $('.social-share a').each(function(){
                $(this).attr('data-share-url', videoUrl);
                $(this).attr('data-share-title', videoTitle);
            });

            $("#video-container-iframe").attr("src", videoUrl);
        }
    }
});
