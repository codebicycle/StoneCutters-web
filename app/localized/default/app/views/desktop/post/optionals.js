'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');
var asynquence = require('asynquence');

module.exports = Base.extend({
    tagName: 'section',
    id: 'posting-optionals-view',
    className: 'posting-optionals-view',
    allFields: [],
    fields: [],
    form: {
        values: {}
    },
    initialize: function() {
        Base.prototype.initialize.call(this);
        this.allFields = [];
        this.fields = [];
        this.form = {
            values: {}
        };
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            fields: this.fields || [],
            form: this.form
        });
    },
    postRender: function() {
        if (!this.firstRender) {
            return;
        }
        this.firstRender = false;
        this.fields.forEach(function each(field) {
            this.$('[name="' + field.name + '"]').trigger('change');
        }.bind(this));
    },
    events: {
        'fieldsChange': 'onFieldsChange',
        'change': 'onChange',
    },
    onFieldsChange: function(event, fields, categoryId, subcategoryId, firstRender) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

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
                this.parentView.$el.trigger('fieldSubmit', {
                    name: name
                });
            }
        }
        this.render();
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
        var fieldData;

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
        
        this.parentView.$el.trigger('fieldSubmit', [$field]);
        
        if (!field.related) {
            return;
        }
        asynquence().or(error)
            .then(fetch)
            .val(success);
    }
});

module.exports.id = 'post/optionals';
