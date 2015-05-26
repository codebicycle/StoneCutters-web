'use strict';

var Base = require('../../../../../../common/app/bases/view').requireView('categories/partials/country-area');

module.exports = Base.extend({
    events: {
        'click [data-modal-close]': 'onCloseModal',
        'click .open-modal': 'onOpenModal',
        'click [data-modal-shadow]': 'onCloseModal',
        'click .list-cities a[data-location]': 'onClickLocation'
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
    },
    onClickLocation: function(event) {
        this.app.session.persist({
            siteLocation: $(event.currentTarget).data('location')
        });
    }
});

module.exports.id = 'categories/partials/country-area';
