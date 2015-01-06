'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('marketing/bannervideo');
var _ = require('underscore');

module.exports = Base.extend({
    events: {
        'click [data-modal-close]': 'onCloseModal',
        'click .open-modal': 'onOpenModal',
        'click [data-modal-shadow]': 'onCloseModal'
    },
    onOpenModal: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        $('#video-gallery-modal').trigger('show');
    },
    onCloseModal: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        $('#video-gallery-modal').trigger('hide');
    }
});

module.exports.id = 'marketing/bannervideo';
