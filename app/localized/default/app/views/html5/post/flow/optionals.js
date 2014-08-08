'use strict';

var Base = require('../../../../../../common/app/bases/view');
var helpers = require('../../../../../../../helpers');
var asynquence = require('asynquence');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'post_flow_optionals_view disabled',
    tagName: 'section',
    id: 'optionals',
    allFields: [],
    fields: [],
    form: {
        values: {}
    },
    selected: {},
    initialize: function() {
        Base.prototype.initialize.call(this);
        this.allFields = [];
        this.fields = [];
        this.form = {
            values: {}
        };
        this.selected = {};
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var category = this.parentView.options.categories.search(this.selected.id) || {};
        var subcategory = this.parentView.options.categories.search(this.selected.subId) || {};

        if (category.toJSON) {
            category = category.toJSON();
        }
        if (subcategory.toJSON) {
            subcategory = subcategory.toJSON();
        }
        return _.extend({}, data, {
            fields: this.fields || [],
            category: category,
            subcategory: subcategory,
            form: this.form
        });
    },
    postRender: function() {
        if (!this.firstRender) {
            return;
        }
        this.firstRender = false;
        this.fields.forEach(function each(field) {
            if (!field.related) {
                return;
            }
            this.$('[name="' + field.name + '"]').trigger('change');
        }.bind(this));
    },
    events: {
        'show': 'onShow',
        'hide': 'onHide',
        'click .change': 'onChangeClick',
        'fieldsChange': 'onFieldsChange',
        'change': 'onChange',
        'submit': 'onSubmit',
        'restart': 'onRestart'
    },
    onShow: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('headerChange', ['Elige una categoria', this.id, '']);
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
    onChangeClick: function(event) {
        this.parentView.$el.trigger('flow', [this.id, 'categories']);
    },
    onFieldsChange: function(event, fields, categoryId, subcategoryId, firstRender) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var show = !this.$el.hasClass('disabled');
        var related = [];
        var names = [];

        this.firstRender = !!firstRender;
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
    onChange: function(event) {
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
    },
    onRestart: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.allFields = [];
        this.fields = [];
        this.form = {
            values: {}
        };
        this.selected = {};
    }
});

module.exports.id = 'post/flow/optionals';
