'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../common/app/bases/view');

module.exports = Base.extend({
    id: 'posting-contact-view',
    tagName: 'section',
    className: 'posting-contact-view',
    selectors: {
        contactName: '#posting-contact-name-view',
        email: '#posting-contact-email-view',
        phone: '#posting-contact-phone-view',
        address: '#posting-contact-address-view',
        locations: '#posting-locations-view',
        modalTerm: '#modal-terms-view'
    },
    events: {
        'validate': onValidate,
        'enablePost': onEnablePost,
        'disablePost': onDisablePost,
        'formRendered': onFormRendered,
        'changeEmail': onChangeEmail,
        'click .open-modal': onOpenModal,
        'click [data-modal-close]': onCloseModal,
        'click [data-modal-shadow]': onCloseModal
    },
    getItem: getItem
});

function getItem() {
    return this.parentView.getItem();
}

function onValidate(event, done, isValid) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var promise = asynquence(isValid).or(done.fail);

    validation.call(this, this.selectors.contactName);
    validation.call(this, this.selectors.email);
    validation.call(this, this.selectors.phone);
    validation.call(this, this.selectors.address);
    validation.call(this, this.selectors.locations);
    promise.val(done);

    function validation(view) {
        promise.then(function(next, result) {
            this.$(view).trigger('validate', [next, result]);
        }.bind(this));
    }
}

function onEnablePost(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.$('.posting').removeAttr('disabled');
}

function onDisablePost(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.$('.posting').attr('disabled', 'disabled');
}

function onFormRendered(event, editing) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.$(this.selectors.email).trigger('formRendered');
    this.$(this.selectors.locations).trigger('formRendered', [editing]);
}

function onChangeEmail(event, email) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.$(this.selectors.email).trigger('change', [email]);
}

function onOpenModal(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    $(this.selectors.modalTerm).trigger('show');
}

function onCloseModal(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    $(this.selectors.modalTerm).trigger('hide');
}

module.exports.id = 'post/contact';
