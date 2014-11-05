'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');
var asynquence = require('asynquence');

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
        var $fields = $('.text-field');

        $fields.each(function() {
            $field = $(this);

            if ($field.val()) {
                $field.trigger('change');
            }
        });
    },
    events: {
        'fieldsChange': 'onFieldsChange',
        'change': 'onChange'
    },
    onFieldsChange: function(event, fields, categoryId, subcategoryId, firstRender) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.fields = _.each(fields, function each(field) {
            if (field.fieldType === 'combobox' && !field.values) {
                field.values = [];
            }

            if (field.values) {
                field.values.unshift({
                    key: '',
                    value: this.parentView.dictionary['misc.SelectAnOption_BR']
                });
            }
        }.bind(this));
        this.fields = fields;
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
        var options;
        var $field = this.$('[name="' + related + '"]');

        var fetch = function(done) {
            helpers.dataAdapter.get(this.app.req, '/items/fields/' + encodeURIComponent(related) + '/' + value + '/subfields', {
                query: {
                    intent: 'post',
                    location: this.app.session.get('siteLocation'),
                    categoryId: this.parentView.form['category.id'],
                    languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
                },
                done: done,
                fail: done.fail
            });
        }.bind(this);

        var error = function(err) {
            console.log(err); // TODO: HANDLE ERRORS
        }.bind(this);

        var success = function(res) {
            $field.removeAttr('disabled').empty();
            options = res.subfield.values;
            options.unshift({
                key: '',
                value: this.parentView.dictionary['misc.SelectAnOption_BR']
            });
            _.each(options, function each(option) {
                $field.append('<option value="' + option.key + '">' + option.value + '</option>');
            });
        }.bind(this);

        asynquence().or(error)
            .then(fetch)
            .val(success);
    }
});

module.exports.id = 'post/optionals';
