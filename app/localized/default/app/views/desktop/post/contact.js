'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../common/app/bases/view');

module.exports = Base.extend({
    id: 'posting-contact-view',
    tagName: 'section',
    className: 'posting-contact-view',
    events: {
        'change': onChange,
        'validate': onValidate,
        'enablePost': onEnablePost,
        'disablePost': onDisablePost,
        'formRendered': onFormRendered,
        'fieldsChange': onFieldsChange,
        'click .open-modal': onOpenModal,
        'click [data-modal-close]': onCloseModal,
        'click [data-modal-shadow]': onCloseModal
    },
    getItem: getItem
});

function onChange(event, options) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    var $field = $(event.currentTarget);

    this.parentView.$el.trigger('fieldSubmit', [$field, options]);
}

function onValidate(event, done, isValid) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var promise = asynquence(isValid).or(done.fail);

    validation.call(this, '#posting-contact-email-view');
    validation.call(this, '#posting-contact-phone-view');
    promise.val(done);

    function validation(view) {
        promise.then(function(next, result) {
            this.$(view).trigger('validate', [next, result]);
        }.bind(this));
    }
}

function onEnablePost(event) {
    this.$('.posting').removeAttr('disabled');
}

function onDisablePost(event) {
    this.$('.posting').attr('disabled', 'disabled');
}

function onFormRendered(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.$('#posting-contact-email-view').trigger('formRendered');
}

function onFieldsChange(event, email) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.$('#posting-contact-email-view').trigger('change', [email]);
}

function onOpenModal(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    $('#modal-terms-view').trigger('show');
}

function onCloseModal(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    $('#modal-terms-view').trigger('hide');
}

function getItem() {
    return this.parentView.getItem();
}

module.exports.id = 'post/contact';
