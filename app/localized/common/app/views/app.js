'use strict';

var Base = require('rendr/client/app_view');
var URLParser = require('url');

module.exports = Base.extend({
    className: 'app_view',
    events: {
        'click .modal-close': 'closeModal',
        'click .title-bar a': 'openModal'
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
    openModal: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        showModal(event.currentTarget.dataset.modal);
    },
    closeModal: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        hideModal(event.currentTarget.dataset.modal);
    }
});

function showModal(classToShow) {
    var windowHeight = window.innerHeight,
        modal = $('.' + classToShow),
        top = 0,
        modalHeight = modal.height();
    if(modalHeight < windowHeight){
        top = (windowHeight/2) -(modalHeight/2);
    }
    modal.css('top',top);

    $('body').css('overflow','hidden');
    $('#modal-overlay').removeClass('modal-hide');
    $('.' + classToShow).removeClass('modal-hide');
}

function hideModal(classToHide) {
    $('body').css('overflow','auto');
    $('#modal-overlay').addClass('modal-hide');
    $('.' + classToHide).addClass('modal-hide');
}

module.exports.id = 'app_view/index';
