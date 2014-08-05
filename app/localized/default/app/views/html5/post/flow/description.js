'use strict';

var Base = require('../../../../../../common/app/bases/view');
var config = require('../../../../../../../config');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'post_flow_description_view disabled',
    tagName: 'form',
    id: 'description',
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

        this.parentView.$el.trigger('headerChange', ['Describe tu aviso', this.id]);
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
            if ($field.hasClass('error')) {
                errors[field.name] = field.label;
            }
        }.bind(this));
        this.$el.addClass('disabled');
        this.parentView.$el.trigger('descriptionSubmit', [this.fields, errors]);
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
        var $title = this.$('input[name=title]').removeClass('error');
        var $description = this.$('textarea[name=description]').removeClass('error');
        var failed = false;

        this.$el.removeClass('error').find('small').remove();
        if ($title.val().length < 10) {
            failed = true;
            this.$el.addClass('error');
            $title.addClass('error').after('<small class="error">El titulo debe tener al menos 10 caracteres</small>');
        }
        if ($description.val().length < 10) {
            failed = true;
            this.$el.addClass('error');
            $description.addClass('error').after('<small class="error">La descripcion debe tener al menos 10 caracteres</small>');
        }
        return !failed;
    }
});

module.exports.id = 'post/flow/description';
