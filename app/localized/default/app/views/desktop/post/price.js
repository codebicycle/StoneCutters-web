'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'section',
    id: 'posting-price-view',
    className: 'posting-price-view',
    fields: [],
    fieldLabel: '',
    fieldName: '',
    fieldMandatory: '',
    initialize: function() {
        Base.prototype.initialize.call(this);
        this.fields = [];
        this.fieldLabel = '';
        this.fieldName = '';
        this.fieldMandatory = '';
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            fields: this.fields || [],
            fieldLabel: this.fieldLabel || '',
            fieldName: this.fieldName || '',
            fieldMandatory: this.fieldMandatory || ''
        });
    },
    events: {
        'fieldsChange': 'onFieldsChange',
        'change': 'onChange'
    },
    onFieldsChange: function(event, fields) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var order = ['currency_type', 'priceC', 'priceType'];

        fields = _.filter(fields, function each(field) {
            return !(field.name === 'title' || field.name === 'description');
        });
        _.each(order, function find(name) {
            this.fields.push(_.find(fields, function search(field) {
                if (field.name === 'priceC') {
                    this.fieldLabel = field.label;
                    this.fieldName = field.name;
                    this.fieldMandatory = field.mandatory;
                }
                return field.name === name;
            }.bind(this)));
        }.bind(this));
        this.render();
    },
    onChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('fieldSubmit', [$(event.target)]);
    }
});

module.exports.id = 'post/price';
