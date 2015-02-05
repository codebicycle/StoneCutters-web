'use strict';

var Base = require('rendr/client/app_view');
var URLParser = require('url');

module.exports = Base.extend({
    className: 'app_view',
    events: {
        'click [data-share-facebook]': 'openFacebook',
        'click [data-share-twitter]': 'openTwitter',
        'click [data-share-gplus]': 'openGplus'
    },
    initialize: function() {
        this.app.on('change:loading', this.loading.bind(this, this.$('#progressBar')));
        this.adserving = [];
        this.on('adserving:CSA', this.onAdservingCSA);
        this.app.router.on('action:end', this.onEnd.bind(this));
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
    onAdservingCSA: function(settings) {
        if (!this.adserving.length) {
            this.adserving.push('ads');
            this.adserving.push(settings.options);
        }
        this.adserving.push(settings.params);
    },
    onEnd: function() {
        if (!this.adserving.length) {
            return;
        }
        window._googCsa.apply(window._googCsa, this.adserving);
        this.adserving = [];
    }
});

module.exports.id = 'app_view/index';
