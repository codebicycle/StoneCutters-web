'use strict';

var Base = require('../../../../../../common/app/bases/view').requireView('categories/partials/country-area');
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
        $('#modal-location-view').trigger('show');
    },
    onCloseModal: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        $('#modal-location-view').trigger('hide');
    }
});

module.exports.id = 'categories/partials/country-area';
