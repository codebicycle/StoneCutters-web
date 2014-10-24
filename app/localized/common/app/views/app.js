'use strict';

var Base = require('rendr/client/app_view');
var URLParser = require('url');

module.exports = Base.extend({
    className: 'app_view',
    events: {
        'click [data-modal-close]': 'toggleModal',
        'click .open-modal': 'toggleModal',
        'click [data-video-item]': 'changeVideo',
        'click [data-icon-facebook]': 'openFacebook',
        'click [data-icon-twitter]': 'openTwitter',
        'click [data-icon-gplus]': 'openGplus',
        'click [data-footer-sliderdown]': 'slideDownContent'
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
        var videoUrl = $('#video-container-iframe').attr('src'),
            url = 'https://www.facebook.com/sharer/sharer.php?u=' + videoUrl;
        this._openWindow(url);
    },
    openTwitter: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        var videoUrl = $('#video-container-iframe').attr('src'),
            videoTitle = $('#video-container-iframe').attr('data-video-title'),
            url = 'https://twitter.com/intent/tweet?original_referer=' + videoUrl + '&text=' + videoTitle + '&url=' + videoUrl;
        this._openWindow(url);
    },
    openGplus: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        var videoUrl = $('#video-container-iframe').attr('src'),
            videoTitle = $('#video-container-iframe').attr('data-video-title'),
            url = "https://plus.google.com/share?url=" + videoUrl;
            this._openWindow(url);
    },
    _changeIframeConfig: function (event) {
            var thisElement = $(event.currentTarget),
                urlVideo = thisElement.attr('data-video-item'),
                videoTitle = thisElement.find('.video-title').text();
            thisElement.parent().siblings().show();
            thisElement.parent().hide();

            $("#video-container-iframe")
                .attr("src","http://www.youtube.com/embed/" + urlVideo)
                .attr("data-video-title", videoTitle);
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
    slideDownContent: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        var element = $(event.currentTarget),
        classTochange = element.attr('data-footer-sliderDown');
         $('a[data-footer-sliderup="' + classTochange + '"]').parent().removeClass('active');
        $('.' + element.attr('data-footer-sliderDown')).hide();
    },
});


module.exports.id = 'app_view/index';
