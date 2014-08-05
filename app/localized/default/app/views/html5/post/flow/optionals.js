'use strict';

var Base = require('../../../../../../common/app/bases/view');
var config = require('../../../../../../../config');
var helpers = require('../../../../../../../helpers');
var asynquence = require('asynquence');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'post_flow_optionals_view disabled',
    tagName: 'form',
    id: 'optionals',
    allFields: [],
    fields: [],
    form: {
        values: {}
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
        'submit': 'onSubmit'
    },
    onShow: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('headerChange', ['Elige una categoria', this.id, 'subcategories', this.selected]);
        this.$el.removeClass('disabled');
    },
    onHide: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var errors = {};

        this.fields.forEach(function each(field) {
            var $field = this.$('[name="' + field.name + '"]');

            field.value = $field.val();
            if ($field.hasClass('error')) {
                errors[field.name] = field.label;
            }
        }.bind(this));
        this.$el.addClass('disabled');
        this.parentView.$el.trigger('optionalsSubmit', [this.fields, errors]);
    },
    onFieldsChange: function(event, fields, categoryId, subcategoryId) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var show = !this.$el.hasClass('disabled');
        var related = [];
        var names = [];

        this.selected = {
            id: categoryId,
            subId: subcategoryId
        };
        this.allFields = fields;
        fields.forEach(function each(field) {
            names.push(field.name);
            if (field.related) {
                related.push(field.related);
            }
        });
        this.fields = fields.filter(function each(field) {
            return !_.contains(related, field.name) || field.fieldType !== 'combobox' || (field.values && field.values.length);
        });
        for (var name in this.form.values) {
            if (!_.contains(names, name)) {
                delete this.form.values[name];
            }
        }
        this.render();
        if (show) {
            this.$el.trigger('show');
        }
    },
    onChange: function() {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $loading = $('body > .loading');
        var $field = $(event.target);
        var name = $field.attr('name');
        var field = _.find(this.fields, function each(field) {
            return field.name === name;
        });

        var fetch = function(done) {
            $loading.show();
            helpers.dataAdapter.get(this.app.req, '/items/fields/' + encodeURIComponent(field.related) + '/' + this.form.values[field.name] + '/subfields', {
                query: {
                    intent: 'post',
                    location: this.app.session.get('siteLocation'),
                    categoryId: this.selected.subId,
                    languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
                },
                done: done,
                fail: done.fail
            }, always);
        }.bind(this);

        var error = function(err) {
            console.log(err); // TODO: HANDLE ERRORS
        }.bind(this);

        var success = function(res) {
            this.$el.trigger('fieldsChange', [this.allFields.map(function each(field) {
                if (field.name !== res.subfield.name) {
                    return field;
                }
                return res.subfield;
            }), this.selected.id, this.selected.subId]);
        }.bind(this);

        var always = function() {
            $loading.hide();
        }.bind(this);

        this.form.values[field.name] = $field.val();
        if (!field.related) {
            return;
        }
        asynquence().or(error)
            .then(fetch)
            .val(success);
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('flow', [this.id, '']);
    }
});

module.exports.id = 'post/flow/optionals';
