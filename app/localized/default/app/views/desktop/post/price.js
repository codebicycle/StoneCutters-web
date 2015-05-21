'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
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
    selectors: {
        currency_type: '#field-currency_type',
        priceC: '#field-priceC',
        priceW: '#field-priceW',
        priceType: '#field-priceType'
    },
    events: {
        'change': onChange,
        'fieldsChange': onFieldsChange,
        'change #field-priceType': onChangePriceType,
        'keyup #field-priceW': onKeyUpPrice,
        'blur #field-priceW': onBlurPrice
    },
    initialize: initialize,
    getTemplateData: getTemplateData,
    filterAndSortFields: filterAndSortFields,
    formatValue: formatValue
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

function filterAndSortFields(fields) {
    var priceFields = [];

    _.each(this.selectors, function each(selector, name) {
        var field = _.find(fields, function find(field) {
            return field.name === name;
        });

        if (field) {
            priceFields.push(field);
        }
    }, this);
    return priceFields;
}

function onChange(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var $field = $(event.target);
    var options = {};

    if ($field.attr('name') === 'priceC') {
        $field.val($field.val().replace(this.rPrice, ''));
        options.skipValidation = $field.val() === '' && _.contains(['NEGOTIABLE', 'FREE'], ($(this.selectors.priceType).val() || '').toUpperCase());
        this.$('select').trigger('change');
    }

    this.parentView.$el.trigger('fieldSubmit', [$field, options]);
}

function onFieldsChange(event, fields) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var priceFields;
    var hasPriceButNotCurrency;

    fields = this.filterAndSortFields(fields);

    if (!fields || !fields.length) {
        this.fields = false;
        this.parentView.$el.trigger('priceReset');
        this.render();
        return;
    }

    priceFields = {};
    _.each(fields, function each(field) {
        if (field.name === 'priceC') {
            this.fieldLabel = field.label;
            this.fieldName = field.name;
            this.fieldMandatory = field.mandatory;
        }
        priceFields[field.name] = field;
    }, this);

    if (!_.isEqual(fields, this.fields)) {
        this.fields = fields;
        if (!priceFields.currency_type && priceFields.priceC) {
            statsd.increment([this.app.session.get('location').abbreviation, this.parentView.editing ? 'editing' : 'posting', 'error', 'currency', 'fetch', this.app.session.get('platform')]);
        }
        this.parentView.$el.trigger('priceReset');
        this.render();
    }
    this.formatValue();
}

function onChangePriceType(event) {
    var $field = $(event.target);
    var $price = this.$(this.selectors.priceC);
    var $currency = this.$(this.selectors.currency_type);

    if ($field.val() === 'FREE') {
        $price.attr('disabled', true).val('');
        $currency.attr('disabled', true);
    }
    else {
        $price.removeAttr('disabled');
        $currency.removeAttr('disabled');
    }
}

function onKeyUpPrice(event) {
    this.formatValue();
}

function onBlurPrice(event) {
    var $field = this.$(this.selectors.priceC);
    var options = {};

    this.formatValue();
    this.parentView.$el.trigger('fieldSubmit', [$field, options]);
}

function formatValue() {
    var $priceW = this.$(this.selectors.priceW);
    var $priceC = this.$(this.selectors.priceC);
    var val;

    val = $priceW.val();
    val = val.replace(/[^\d]/g, '');
    $priceC.val(val);
    val = helpers.common.countFormat(val, this.app);
    $priceW.val(val);
}

module.exports.id = 'post/price';
