'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');
var rPrice = /[^0-9]/gi;

module.exports = Base.extend({
    tagName: 'section',
    id: 'posting-price-view',
    className: 'posting-price-view',
    fields: false,
    fieldLabel: '',
    fieldName: '',
    fieldMandatory: '',
    initialize: function() {
        Base.prototype.initialize.call(this);
        this.fields = false;
        this.fieldLabel = '';
        this.fieldName = '';
        this.fieldMandatory = '';
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            fields: this.fields,
            label: this.fieldLabel || '',
            name: this.fieldName || '',
            mandatory: this.fieldMandatory || ''
        });
    },
    events: {
        'fieldsChange': 'onFieldsChange',
        'change': 'onChange',
        'change #field-priceType': 'onPriceTypeChange'
    },
    onFieldsChange: function(event, options) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var fields = [];

        if (options.length) {
            _.each(['currency_type', 'priceC', 'priceType'], function find(name) {
                fields.push(_.find(options, function search(field) {
                    if (field.name === 'priceC') {
                        this.fieldLabel = field.label;
                        this.fieldName = field.name;
                        this.fieldMandatory = field.mandatory;
                    }
                    return field.name === name;
                }.bind(this)));
            }.bind(this));
            if (!_.isEqual(fields, this.fields)) {
                this.fields = fields;
                this.parentView.$el.trigger('priceReset');
                this.render();
            }
        }
        else {
            this.fields = false;
            this.parentView.$el.trigger('priceReset');
            this.render();
        }
    },
    onChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = $(event.target);
        var options = {};

        if ($field.attr('name') === 'priceC') {
            $field.val($field.val().replace(rPrice, ''));
            options.skipValidation = $field.val() === '' && _.contains(['NEGOTIABLE', 'FREE'], ($('#field-priceType').val() || '').toUpperCase());
            this.$('select').trigger('change');
        }

        this.parentView.$el.trigger('fieldSubmit', [$field, options]);
    },
    onPriceTypeChange: function(event) {
        var $field = $(event.target);
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
});

module.exports.id = 'post/price';
