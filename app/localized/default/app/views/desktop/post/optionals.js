'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');
var asynquence = require('asynquence');
var translations = require('../../../../../../../shared/translations');

module.exports = Base.extend({
    tagName: 'section',
    id: 'posting-optionals-view',
    className: 'posting-optionals-view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            fields: this.fields || [],
            form: this.form
        });
    },
    postRender: function() {
        var $field;
        var $fields = this.$('.text-field');

        $fields.each(function() {
            $field = $(this);

            if ($field.val()) {
                $field.trigger('change');
            }
            if ($field.hasClass('type-select') && !$field.find('option').length) {
                $field.parents('.field-wrapper').hide();
            }
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

        _.each(this.fields || [], function each(field) {
            this.parentView.getItem().unset(field.name);
        }, this);
        this.fields = _.map(fields, function each(field) {
            if (field.fieldType !== 'combobox') {
                return field;
            }
            if (!field.values) {
                field.values = [];
            }
            if (field.values.length) {
                field.values.unshift({
                    key: '',
                    value: translations.get(this.app.session.get('selectedLanguage'))['misc.SelectAnOption_BR']
                });
            }
            return field;
        }, this);
        this.render();
    },
    onChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = $(event.target);
        var $firstOption = $field.find('option').first();

        if ($field.data('related')) {
            this.getRelatedFieldValues($field.data('related'), $field.val());
        }
        if ($firstOption.attr('value') === '') {
            $firstOption.remove();
        }
        this.parentView.$el.trigger('fieldSubmit', [$field]);
    },
    getRelatedFieldValues: function(related, value) {
        var $field = this.$('[name="' + related + '"]');

        var fetch = function(done) {
            helpers.dataAdapter.get(this.app.req, '/items/fields/' + encodeURIComponent(related) + '/' + value + '/subfields', {
                query: {
                    intent: 'post',
                    location: this.app.session.get('siteLocation'),
                    categoryId: this.parentView.item.get('category').id,
                    languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
                },
            }, done.errfcb);
        }.bind(this);

        var success = function(res, body) {
            var field = _.find(this.fields, function each(field) {
                return field.name === body.subfield.name;
            }, this);
            var $wrapper = $field.empty().parents('.field-wrapper');
            var value = field.value || {};

            _.extend(field, body.subfield);
            if (!field.values.length) {
                $field.attr('disabled', 'disabled');
                $wrapper.hide();
                return;
            }
            $field.removeAttr('disabled');
            field.values.unshift({
                key: '',
                value: translations.get(this.app.session.get('selectedLanguage'))['misc.SelectAnOption_BR']
            });
            _.each(field.values, function each(option) {
                $field.append('<option value="' + option.key + '"' + (value.key === option.key ? ' selected' : '') + '>' + option.value + '</option>');
            });
            $field.parent().siblings('label').text(field.label);
            $field.attr('name', field.name);
            $wrapper.show();
        }.bind(this);

        var error = function(err) {
            console.log(err); // TODO: HANDLE ERRORS
        }.bind(this);

        asynquence().or(error)
            .then(fetch)
            .val(success);
    }
});

module.exports.id = 'post/optionals';
