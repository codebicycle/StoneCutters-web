'use strict';

var Base = require('../../../../../../common/app/bases/view');
var config = require('../../../../../../../config');
var _ = require('underscore');
var rEmail = /[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,4}/;

module.exports = Base.extend({
    className: 'post_flow_contact_view disabled',
    tagName: 'form',
    id: 'contact',
    fields: [],
    form: {
        values: {}
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            fields: this.fields || [],
            form: this.form
        });
    },
    events: {
        'show': 'onShow',
        'hide': 'onHide',
        'fieldsChange': 'onFieldsChange',
        'change': 'onChange',
        'submit': 'onSubmit'
    },
    onShow: function(event, categoryId) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('headerChange', ['Detalles de contacto', this.id]);
        this.$el.removeClass('disabled');
    },
    onHide: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var errors = {};

        this.fields.forEach(function each(field) {
            var $field = this.$('[name=' + field.name + ']');

            field.value = $field.val();
            if (field.name == 'email' && $field.hasClass('error')) {
                errors[field.name] = field.label;
            }
        }.bind(this));
        this.$el.addClass('disabled');
        this.parentView.$el.trigger('contactSubmit', [this.fields, errors]);
    },
    onFieldsChange: function(event, fields) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.fields = fields;
        this.render();
    },
    onChange: function() {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = $(event.target);

        this.form.values[$field.attr('name')] = $field.val();
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (this.validate()) {
            this.parentView.$el.trigger('flow', [this.id, '']);
        }
    },
    validate: function() {
        var $contactName = this.$('input[name=contactName]').removeClass('error');
        var $email = this.$('input[name=email]').removeClass('error');
        var failed = false;

        this.$el.removeClass('error').find('small').remove();
        if (!$contactName.val().length) {
            failed = true;
            this.$el.addClass('error');
            $contactName.addClass('error').after('<small class="error">Ingresa tu nombre para que los compradores sepan quien sos</small>');
        }
        if (!rEmail.test($email.val())) {
            failed = true;
            this.$el.addClass('error');
            $email.addClass('error').after('<small class="error">Ingresa un email válido</small>');
        }
        return !failed;
    }
});

module.exports.id = 'post/flow/contact';
