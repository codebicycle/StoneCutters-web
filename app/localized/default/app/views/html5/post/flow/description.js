'use strict';

var Base = require('../../../../../../common/app/bases/view');
var _ = require('underscore');
var translations = require('../../../../../../../../shared/translations');

module.exports = Base.extend({
    className: 'post_flow_description_view disabled',
    tagName: 'section',
    id: 'description',
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
        'submit': 'onSubmit',
        'restart': 'onRestart',
        'priceTypeChange': 'onPriceTypeChange'
    },
    onShow: function(event, categoryId) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('headerChange', [this.parentView.dictionary['misc.DescribeYourAd_Mob'], this.id]);
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
                errors[field.name] = field.label; // Check for translation since we are just passing the field label as error
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
    onChange: function(event) {
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
        var $priceType = this.$('select[name=priceType]');
        var $priceC = this.$('input[name=priceC]').removeClass('error');
        var failed = false;

        this.$el.removeClass('error').find('small').remove();
        if ($title.val().length < 10) {
            failed = true;
            this.$el.addClass('error');
            $title.addClass('error').after('<small class="error">' + this.parentView.dictionary['misc.TitleCharacters_Mob'].replace('<<NUMBER>>', '10') + '</small>');
        }
        if ($description.val().length < 10) {
            failed = true;
            this.$el.addClass('error');
            $description.addClass('error').after('<small class="error">' + this.parentView.dictionary['misc.DescriptionCharacters_Mob'].replace('<<NUMBER>>', '10') + '</small>');
        }
        if ($priceType.val() === 'FIXED' && $priceC.val() < 1) {
            failed = true;
            this.$el.addClass('error');
            $priceC.addClass('error').after('<small class="error">' + this.parentView.dictionary["postingerror.PleaseEnterANumericalValue"] + '</small>');
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

module.exports.id = 'post/flow/description';
