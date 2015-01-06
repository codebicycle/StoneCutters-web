'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('modals/modal');
var _ = require('underscore');

module.exports = Base.extend({
    idModal: 'base-modal',
    events: {
        'show': 'onShow',
        'hide': 'onHide'
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
    }
});
