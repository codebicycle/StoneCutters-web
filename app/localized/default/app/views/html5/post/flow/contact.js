'use strict';

var Base = require('../../../../../../common/app/bases/view');
var _ = require('underscore');
var rEmail = /[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,4}/;

module.exports = Base.extend({
    className: 'post_flow_contact_view disabled',
    tagName: 'section',
    id: 'contact',
    fields: [],
    form: {
        values: {}
    },
    initialize: function() {
        Base.prototype.initialize.call(this);
        this.fields = [];
        this.form = {
            values: {}
        };
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        this.city = this.city || this.app.session.get('location').current;
        return _.extend({}, data, {
            fields: this.fields || [],
            form: this.form,
            location: this.city || {}
        });
    },
    postRender: function() {
        this.city = this.city || this.app.session.get('location').current;
    },
    events: {
        'show': 'onShow',
        'hide': 'onHide',
        'fieldsChange': 'onFieldsChange',
        'change': 'onChange',
        'click .location': 'onLocationClick',
        'locationChange': 'onLocationChange',
        'submit': 'onSubmit',
        'restart': 'onRestart'
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
        this.parentView.$el.trigger('contactSubmit', [this.fields, this.city || {}, errors, 'Ubicacion']);
    },
    onFieldsChange: function(event, fields) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.fields = fields;
        this.render();
    },
    onChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = $(event.target);

        this.form.values[$field.attr('name')] = $field.val();
    },
    onLocationClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('flow', [this.id, 'location']);
    },
    onLocationChange: function(event, city, error) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var show = !this.$el.hasClass('disabled');

        this.city = city.url ? city : this.app.session.get('location').current;
        this.render();
        this.validate();
        if (show) {
            this.$el.trigger('show');
        }
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
        var $location = this.$('.location').removeClass('error');
        var failed = false;

        this.$el.removeClass('error').find('small').remove();
        if (!$contactName.val().length) {
            failed = true;
            $contactName.addClass('error').after('<small class="error">Ingresa tu nombre para que los compradores sepan quien sos</small>');
        }
        if (!rEmail.test($email.val())) {
            failed = true;
            $email.addClass('error').after('<small class="error">Ingresa un email válido</small>');
        }
        if (!this.city) {
            failed = true;
            $location.addClass('error').after('<small class="error">Tu aviso debe estar localizado en una ciudad</small>');
        }
        if (failed) {
            this.$el.addClass('error');
        }
        return !failed;
    },
    onRestart: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.fields = [];
        this.form = {
            values: {}
        };
    }
});

module.exports.id = 'post/flow/contact';
