'use strict';

var Base = require('rendr/client/app_view');
var URLParser = require('url');

module.exports = Base.extend({
    className: 'app_view',
    events: {
        'click [data-modal-close]': 'toggleModal',
        'click .open-modal': 'toggleModal',
        'click [data-video-item]': 'changeVideo',
        'click [data-share-facebook]': 'openFacebook',
        'click [data-share-twitter]': 'openTwitter',
        'click [data-share-gplus]': 'openGplus',
    },
    initialize: function() {
        this.app.on('change:loading', this.loading.bind(this, this.$('#progressBar')));
        window.initTracker();
    },
    loading: function($progressBar, app, isLoading) {
        if (isLoading){
            $progressBar.show();
            $progressBar.width('80%');
        }
        else{
            $progressBar.width('100%');
            $('body').removeClass('noscroll');
            $('.footer-slide').hide();
            $('.select .active').removeClass('active');
            window.setTimeout(function onTimeout(){
                $progressBar.hide();
                $progressBar.width('0');
                $('body').trigger('update:postingLink');
            }, 500);
        }
    },
    _interceptClick: function(e) {
        var href = $(e.currentTarget).attr('href');
        var url = URLParser.parse(href);

        if (url.host === window.location.host) {
            href = [url.pathname, (url.search || ''), (url.hash || '')].join('');
        }
        if (this.shouldInterceptClick(href, e.currentTarget, e)) {
            e.preventDefault();
            this.app.router.redirectTo(href);
        }
    },
    toggleModal: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        $('body').toggleClass('noscroll');
        $('#' + event.currentTarget.dataset.modal).toggleClass('modal-visible');
    },
    changeVideo: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        this._changeIframeConfig(event);

    },
    openFacebook: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        var shareUrl = event.currentTarget.dataset.shareUrl,
            url = 'https://www.facebook.com/sharer/sharer.php?u=' + shareUrl;
        this._openWindow(url);
    },
    openTwitter: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        var shareUrl = event.currentTarget.dataset.shareUrl,
            shareTitle = event.currentTarget.dataset.shareTitle,
            url = 'https://twitter.com/intent/tweet?original_referer=' + shareUrl + '&text=' + shareTitle + '&url=' + shareUrl;
        this._openWindow(url);
    },
    openGplus: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        var shareUrl = event.currentTarget.dataset.shareUrl,
            url = "https://plus.google.com/share?url=" + shareUrl;
            this._openWindow(url);
    },
    _changeIframeConfig: function (event) {
            var thisElement = $(event.currentTarget),
                urlVideo = thisElement.attr('data-video-item'),
                urlVideoFull = "http://www.youtube.com/embed/" + urlVideo,
                videoTitle = thisElement.find('.video-title').text();
            thisElement.parent().siblings().show();
            thisElement.parent().hide();

            // Change share buttons data
            $('.social-share a').each(function(){
                $(this).attr('data-share-url', urlVideoFull);
                $(this).attr('data-share-title', videoTitle);
            });

            $("#video-container-iframe").attr("src", urlVideoFull);
    },
    _openWindow: function (url) {
        var width =  626,
        height = 436,
        left = (screen.width/2)-(width/2),
        top = (screen.height/2)-(height/2);
        window.open(
            url,
            'myWindow',
            'height=' + height +
            ',width=' + width +
            ', top=' + top +
            ', left=' + left
        );
    },
});


module.exports.id = 'app_view/index';
