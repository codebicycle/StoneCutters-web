'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('modals/modal', null, 'desktop');
var _ = require('underscore');

module.exports = Base.extend({
    id: 'modal-location-view',
    idModal: 'location-modal',
    events: _.extend({}, Base.prototype.events, {
        'click .location-content a[data-location]': 'onClickLocation'
    }),
    onClickLocation: function(event) {
        this.app.session.persist({
            siteLocation: $(event.currentTarget).data('location')
        });
    }
});

module.exports.id = 'modals/location';
