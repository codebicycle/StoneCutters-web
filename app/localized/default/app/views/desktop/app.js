'use strict';

var Base = require('../../../../../common/app/views/app');

module.exports = Base.extend({
    events: {
        'click .modal-close': 'closeModal',
        'click .open-modal': 'openModal'
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
    },
    openVideo: function(event) {

    }
});

function showModal(idToShow) {

    var windowHeight = window.innerHeight,
        modalTitle,
        modal = $('.modal'),
        modalHeader = modal.children('.modal-header'),
        content = $('#' + idToShow).html(),
        top = 0,
        marginLeft,
        modalWidth,
        calculateModalHeight,
        modalHeight = 'auto';


    //modal.children('.modal-content').html(content);
    calculateModalHeight = modal.height();

    if(idToShow == 'video-gallery') {
        modalTitle = '<span class="first-part">Vender es fácil </span><span class="second-part">Publica gratis en OLX</span>';
        modalWidth = '960';
        modal.addClass('video-modal');
        calculateModalHeight = 498;
    } else {
        modalTitle = 'Selecciona tu ciudad o provincia en Bolivia';
        modalWidth = '720';
    }

    marginLeft = -(modalWidth/2);
    if(calculateModalHeight < windowHeight){
        top = (windowHeight/2) -(calculateModalHeight/2);
    }

    //modalHeader.children("h3").html(modalTitle);

    modal.css('top',top).
        css('margin-left', marginLeft).
        css('height',modalHeight).
        css('width',modalWidth);

    $('body').css('overflow','hidden');
    $('#modal-overlay').removeClass('modal-hide');
    $('.modal').removeClass('modal-hide');
}

function hideModal(classToHide) {
    $('body').css('overflow','auto');
    $('#modal-overlay').addClass('modal-hide');
    $('.modal').addClass('modal-hide').removeClass('video-modal');
}
