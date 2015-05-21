'use strict';

var _ = require('underscore');
var Base = require('../../../../../../common/app/bases/view');
var helpers = require('../../../../../../../helpers');
var translations = require('../../../../../../../../shared/translations');
var statsd = require('../../../../../../../../shared/statsd')();

module.exports = Base.extend({
    className: 'post_flow_description_view disabled',
    tagName: 'section',
    id: 'description',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var item = this.parentView.getItem ? this.parentView.getItem() :  undefined;

        return _.extend({}, data, {
            fields: this.fields || [],
            form: item ? {
                values: _.object(_.map(this.fields || [], function each(field) {
                    return field.name;
                }, this), _.map(this.fields, function each(field) {
                    if (field.name !== 'priceC') {
                        return item.get(field.name);
                    }
                    if (item.get('price') && item.get('price').amount) {
                        return item.get('price').amount;
                    }
                    return item.get('price');
                }, this))
            } : {}
        });
    },
    postRender: function() {
        var field = _.find(this.fields || [], function each(field) {
            return field.name === 'priceType';
        }, this);

        if (field && field.value && field.value.key && field.value.key !== this.parentView.getItem().get('priceType')) {
            this.parentView.getItem().set('priceType', field.value.key);
            this.render();
        }
        this.$el.trigger('priceTypeChange');
    },
    events: {
        'show': 'onShow',
        'hide': 'onHide',
        'fieldsChange': 'onFieldsChange',
        'change': 'onChange',
        'submit': 'onSubmit',
        'priceTypeChange': 'onPriceTypeChange',
        'keyup #text-priceW': 'onKeyUpPrice',
        'blur #text-priceW': 'onBlurPrice'
    },
    onShow: function(event, categoryId) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('headerChange', [translations.get(this.app.session.get('selectedLanguage'))['misc.DescribeYourAd_Mob'], this.id]);
        this.$el.removeClass('disabled');
    },
    onHide: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var errors = {};

        this.fields.forEach(function each(field) {
            var $field = this.$('[name=' + field.name + ']');

            if ($field.hasClass('error')) {
                errors[field.name] = field.label; // Check for translation since we are just passing the field label as error
            }
        }.bind(this));
        this.$el.addClass('disabled');
        this.parentView.$el.trigger('descriptionSubmit', [errors]);
    },
    onFieldsChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.fields = this.parentView.getFields().productDescription;
        this.render();
        this.$el.trigger('priceTypeChange');
    },
    onChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = $(event.target);
        var name = $field.attr('name');
        var value = $field.val();

        if (name !== 'priceType') {
            value = this.cleanValue(value);
            $field.val(value);
        }
        this.parentView.getItem().set(name !== 'priceC' ? name : 'price', value);
        if (name === 'priceType') {
            this.$el.trigger('priceTypeChange');
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
        var $title = this.$('input[name=title]').removeClass('error');
        var $description = this.$('textarea[name=description]').removeClass('error');
        var $priceType = this.$('select[name=priceType]');
        var $priceC = this.$('input[name=priceC]').removeClass('error');
        var failed = false;
        var location = this.app.session.get('location').abbreviation;

        this.$el.removeClass('error').find('small').remove();
        if ($title.val().length < 10) {
            failed = true;
            this.$el.addClass('error');
            $title.addClass('error').after('<small class="error">' + translations.get(this.app.session.get('selectedLanguage'))['misc.TitleCharacters_Mob'].replace('<<NUMBER>>', ' 10 ') + '</small>');
            statsd.increment([location, 'posting', 'invalid', this.app.session.get('platform'), 'title']);
        }
        if ($description.val().length < 10) {
            failed = true;
            this.$el.addClass('error');
            $description.addClass('error').after('<small class="error">' + translations.get(this.app.session.get('selectedLanguage'))['misc.DescriptionCharacters_Mob'].replace('<<NUMBER>>', ' 10 ') + '</small>');
            statsd.increment([location, 'posting', 'invalid', this.app.session.get('platform'), 'description']);
        }
        if ($priceType.val() === 'FIXED' && $priceC.val() < 1) {
            failed = true;
            this.$el.addClass('error');
            $priceC.addClass('error').after('<small class="error">' + translations.get(this.app.session.get('selectedLanguage'))["postingerror.PleaseEnterANumericalValue"] + '</small>');
            statsd.increment([location, 'posting', 'invalid', this.app.session.get('platform'), 'priceC']);
        }
        return !failed;
    },
    onPriceTypeChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $currency = this.$('[name=currency_type]');
        var $price = this.$('[name=priceW]');
        var value = this.parentView.getItem().get('priceType') || this.$('[name=priceType]').val();

        if (value === 'FIXED' || value === 'NEGOTIABLE') {
            $currency.removeAttr('disabled');
            $price.removeAttr('disabled');
        }
        else {
            $currency.attr('disabled', 'disabled');
            $price.attr('disabled', 'disabled').removeClass('error');
            $price.next('small').remove();
        }
    },
    cleanValue: function(value) {
        value = value.replace(/\s{2,}/g, ' ');
        value = value.trim();
        if (value === value.toUpperCase()) {
            value = value.toLowerCase();
        }
        return value;
    },
    onKeyUpPrice: function(event) {
        this.formatValue();
    },
    onBlurPrice: function(event) {
        var $field = this.$('#text-priceW');
        var options = {};

        this.formatValue();
    },
    formatValue: function() {
        var $priceW = this.$('#text-priceW');
        var $priceC = this.$('#text-priceC');
        var val;

        val = $priceW.val();
        val = val.replace(/[^\d]/g, '');
        $priceC.val(val).trigger('change');
        val = helpers.common.countFormat(val, this.app);
        $priceW.val(val);
    }
});

module.exports.id = 'post/flow/description';
