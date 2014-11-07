'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

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
        'change': 'onChange'
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

        if ($field.attr('name') === 'priceC') {
            this.$('select').trigger('change');
        }
        this.parentView.$el.trigger('fieldSubmit', [$field]);
    }
});

module.exports.id = 'post/price';
