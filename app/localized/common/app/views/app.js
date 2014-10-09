'use strict';

var Base = require('rendr/client/app_view');
var URLParser = require('url');

module.exports = Base.extend({
    className: 'app_view',
    events: {
        'click .modal-close': 'toggleModal',
        'click .open-modal': 'toggleModal'
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
    }
});

module.exports.id = 'app_view/index';
