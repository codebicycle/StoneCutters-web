'use strict';

var Base = require('../../../../../common/app/bases/view');

module.exports = Base.extend({
    id: 'posting-success-featuread-view',
    tagName: 'main',
    className: 'posting-success-featuread-view',
    events: {
        'click .open-modal': onOpenModal,
        'click [data-modal-close]': onCloseModal,
        'click [data-modal-shadow]': onCloseModal
    }
});

function onOpenModal(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    $('#modal-featuread-view').trigger('show');
}

function onCloseModal(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    $('#modal-featuread-view').trigger('hide');
}

module.exports.id = 'post/feature_ad';
