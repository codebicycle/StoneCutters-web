'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'section',
    id: 'posting-contact-view',
    className: 'posting-contact-view',
    events: {
        'change': 'onChange',
        'disablePost': 'onDisablePost',
        'enablePost': 'onEnablePost',
        'click [data-modal-close]': 'onCloseModal',
        'click .open-modal': 'onOpenModal',
        'click [data-modal-shadow]': 'onCloseModal',
        'paste [name="phone"]': 'onPaste',
        'fieldsChange': 'onFieldsChange',
        'formRendered': 'onFormRendered'
    },
    onPaste: function(event) {
        event.preventDefault();

        var $phone = this.$('[name="phone"]');
        var phone = (event.originalEvent || event).clipboardData.getData('text/plain') || $phone.val();

        $phone.val(phone.replace(/[^\d]/gi, ''));
        return true;
    },
    onChange: function(event, options) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('fieldSubmit', [$(event.target), options]);
    },
    onDisablePost: function(event) {
        this.$('.posting').attr('disabled', 'disabled');
    },
    onEnablePost: function(event) {
        this.$('.posting').removeAttr('disabled');
    },
    onOpenModal: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        $('#modal-terms-view').trigger('show');
    },
    onCloseModal: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        $('#modal-terms-view').trigger('hide');
    },
    onFieldsChange: function(event, email) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('[name="email"]').val(email).trigger('change');
    },
    onFormRendered: function(event) {
        var $email = this.$('[name="email"]');
        var category = this.parentView.getItem().get('category');
        var options = {
            pendingValidation: (category.id === undefined || category.parentId === undefined)
        };

        if ($email.val()) {
            $email.trigger('change', [options]);
        }
    }
});

module.exports.id = 'post/contact';
