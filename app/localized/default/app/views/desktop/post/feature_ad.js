'use strict';

var Base = require('../../../../../common/app/bases/view');

module.exports = Base.extend({
    className: 'posting-success-featuread-view',
    id: 'posting-success-featuread-view',
    tagName: 'main',
    events: {
        'click [data-modal-close]': 'onCloseModal',
        'click [data-modal-shadow]': 'onCloseModal',
        'click .open-modal': 'onOpenModal'
    },
    onOpenModal: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        $('#modal-featuread-view').trigger('show');
    },
    onCloseModal: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        $('#modal-featuread-view').trigger('hide');
    }
});

module.exports.id = 'post/feature_ad';
