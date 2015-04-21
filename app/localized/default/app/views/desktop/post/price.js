'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view');
var statsd = require('../../../../../../../shared/statsd')();

module.exports = Base.extend({
    id: 'posting-price-view',
    tagName: 'section',
    className: 'posting-price-view',
    rPrice: /[^0-9]/gi,
    fields: false,
    fieldLabel: '',
    fieldName: '',
    fieldMandatory: '',
    events: {
        'change': onChange,
        'fieldsChange': onFieldsChange,
        'change #field-priceType': onChangePriceType
    },
    initialize: initialize,
    getTemplateData: getTemplateData
});

function initialize() {
    Base.prototype.initialize.call(this);
    this.fields = false;
    this.fieldLabel = '';
    this.fieldName = '';
    this.fieldMandatory = '';
}

function getTemplateData() {
    var data = Base.prototype.getTemplateData.call(this);

    return _.extend({}, data, {
        fields: this.fields,
        label: this.fieldLabel || '',
        name: this.fieldName || '',
        mandatory: this.fieldMandatory || ''
    });
}

function onChange(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var $field = $(event.currentTarget);
    var options = {};

    if ($field.attr('name') === 'priceC') {
        $field.val($field.val().replace(this.rPrice, ''));
        options.skipValidation = $field.val() === '' && _.contains(['NEGOTIABLE', 'FREE'], ($('#field-priceType').val() || '').toUpperCase());
        this.$('select').trigger('change');
    }

    this.parentView.$el.trigger('fieldSubmit', [$field, options]);
}

function onFieldsChange(event, options) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var fields = [];
    var hasPriceButNotCurrency = false;

    if (options.length) {
        _.each(['currency_type', 'priceC', 'priceType'], function find(name) {
            var length = fields.length;
            var field = _.find(options, function search(field) {
                if (field.name === 'priceC') {
                    this.fieldLabel = field.label;
                    this.fieldName = field.name;
                    this.fieldMandatory = field.mandatory;
                }
                return field.name === name;
            }.bind(this));

            if (field) {
                fields.push(field);
            }
            if (name === 'currency_type' && length === fields.length) {
                hasPriceButNotCurrency = true;
            }
            else if (name === 'priceC' && hasPriceButNotCurrency) {
                hasPriceButNotCurrency = length !== fields.length;
            }
        }, this);
        if (!_.isEqual(fields, this.fields)) {
            this.fields = fields;
            if (hasPriceButNotCurrency) {
                statsd.increment([this.app.session.get('location').abbreviation, this.parentView.editing ? 'editing' : 'posting', 'error', 'currency', 'fetch', this.app.session.get('platform')]);
            }
            this.parentView.$el.trigger('priceReset');
            this.render();
        }
    }
    else {
        this.fields = false;
        this.parentView.$el.trigger('priceReset');
        this.render();
    }
}

function onChangePriceType(event) {
    var $field = $(event.currentTarget);
    var $price = this.$('#field-priceC');
    var $currency = this.$('#field-currency_type');

    if ($field.val() === 'FREE') {
        $price.attr('disabled', true).val('');
        $currency.attr('disabled', true);
    }
    else {
        $price.removeAttr('disabled');
        $currency.removeAttr('disabled');
    }
}

module.exports.id = 'post/price';
