'use strict';

var Base = require('../../../../../../common/app/bases/view');
var _ = require('underscore');
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
        'priceTypeChange': 'onPriceTypeChange'
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
            value = this.cleanValue($field.val());
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
        var language = this.app.session.get('selectedLanguage');
        var failed = [];

        this.$el.removeClass('error').find('small').remove();
        if ($title.val().length < 10) {
            failed.push('title');
            this.$el.addClass('error');
            $title.addClass('error').after('<small class="error">' + translations.get(language)['misc.TitleCharacters_Mob'].replace('<<NUMBER>>', ' 10 ') + '</small>');
        }
        if ($description.val().length < 10) {
            failed.push('description');
            this.$el.addClass('error');
            $description.addClass('error').after('<small class="error">' + translations.get(language)['misc.DescriptionCharacters_Mob'].replace('<<NUMBER>>', ' 10 ') + '</small>');
        }
        if ($priceType.val() === 'FIXED' && $priceC.val() < 1) {
            failed.push('priceC');
            this.$el.addClass('error');
            $priceC.addClass('error').after('<small class="error">' + translations.get(language)["postingerror.PleaseEnterANumericalValue"] + '</small>');
        }
        failed.forEach(function each(field) {
            var locale = this.app.session.get('location').abbreviation.toLowerCase();
            var type = this.parentView.getItem().get('id') ? 'editing' : 'posting';
            var platform = this.app.session.get('platform');

            statsd.increment([locale, type, 'error', 'validation', 200, field, platform]);
        });
        return !failed.length;
    },
    onPriceTypeChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $currency = this.$('[name=currency_type]');
        var $price = this.$('[name=priceC]');
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
        value.trim();
        if (value === value.toUpperCase()) {
            value.toLowerCase();
        }
        return value;
    }
});

module.exports.id = 'post/flow/description';
