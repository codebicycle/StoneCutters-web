'use strict';

var Base = require('../../../../../../common/app/bases/view').requireView('post/flow/index');
var helpers = require('../../../../../../../helpers');
var asynquence = require('asynquence');
var _ = require('underscore');

module.exports = Base.extend({
    form: {},
    errors: {},
    postRender: function() {
        this.app.router.once('action:end', this.onStart);
        this.app.router.once('action:start', this.onEnd);
    },
    onStart: function(event) {
        this.appView.trigger('postingflow:start');
    },
    onEnd: function(event) {
        this.appView.trigger('postingflow:end');
    },
    events: {
        'flow': 'onFlow',
        'headerChange': 'onHeaderChange',
        'categorySubmit': 'onCategorySubmit',
        'subcategorySubmit': 'onSubcategorySubmit',
        'optionalsSubmit': 'onOptionalsSubmit',
        'descriptionSubmit': 'onDescriptionSubmit',
        'contactSubmit': 'onContactSubmit',
        'submit': 'onSubmit'
    },
    onFlow: function(event, from, to, data) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('#' + (to || 'hub')).trigger('show', data || {});
        this.$('#' + from).trigger('hide', data || {});
    },
    onHeaderChange: function(event, title, current, back, data) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('header').trigger('change', [title, current, back || 'hub', data]);
    },
    onCategorySubmit: function(event, category, error) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (this.form['category.parentId'] !== category.id) {
            delete this.form['category.id'];
        }
        this.form['category.parentId'] = category.id;
        this.errors['category.parentId'] = error;
        this.$('#hub').trigger('categoryChange', [this.form['category.parentId'], this.form['category.id'], this.errors['category.parentId'], this.errors['category.id']]);
    },
    onSubcategorySubmit: function(event, subcategory, error) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.form['category.id'] = subcategory.id;
        this.errors['category.id'] = error;
        this.$('#hub').trigger('categoryChange', [this.form['category.parentId'], this.form['category.id'], this.errors['category.parentId'], this.errors['category.id']]);
        this.$('#optionals').trigger('fieldsChange', [subcategory.fields.get('fields').categoryAttributes, this.form['category.parentId'], this.form['category.id']]);
        this.$('#description').trigger('fieldsChange', [subcategory.fields.get('fields').productDescription]);
        this.$('#contact').trigger('fieldsChange', [subcategory.fields.get('fields').contactInformation]);
    },
    onOptionalsSubmit: function(event, fields, errors) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        fields.forEach(function each(field) {
            if (field.value) {
                this.form[field.name] = field.value;
            }
            else {
                delete this.form[field.name];
            }
        }.bind(this));
    },
    onDescriptionSubmit: function(event, fields, errors) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        fields.forEach(function each(field) {
            if (field.value) {
                this.form[field.name] = field.value;
            }
            else {
                delete this.form[field.name];
            }
        }.bind(this));
        this.$('#hub').trigger('descriptionChange', [fields, errors]);
    },
    onContactSubmit: function(event, fields, errors) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        fields.forEach(function each(field) {
            if (field.value) {
                this.form[field.name] = field.value;
            }
            else {
                delete this.form[field.name];
            }
        }.bind(this));
        this.$('#hub').trigger('contactChange', [fields, errors]);
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $loading = $('body > .loading').show();
        var query = {
            postingSession: this.options.postingsession
        };
        var user = this.app.session.get('user');

        var validate = function(done) {
            query.intent = 'validate';
            helpers.dataAdapter.post(this.app.req, '/items', {
                query: query,
                data: this.form
            }, done.errfcb);
        }.bind(this);

        var post = function(done, response) {
            query.intent = 'create';
            helpers.dataAdapter.post(this.app.req, '/items', {
                query: query,
                data: this.form,
                done: done,
                fail: done.fail
            });
        }.bind(this);

        var fail = function(err) {
            always();
            console.log(err); // TODO: HANDLE ERRORS
        }.bind(this);

        var success = function(item) {
            this.app.router.once('action:end', always);
            helpers.common.redirect.call(this.app.router, '/posting/success/' + item.id + '?sk=' + item.securityKey, null, {
                status: 200
            });
        }.bind(this);

        var always = function() {
            $loading.hide();
        }.bind(this);

        if (user) {
            query.token = user.token;
        }
        this.form.languageId = this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id;
        this.form.platform = this.app.session.get('platform');
        this.form.location = this.app.session.get('siteLocation');
        this.form.ipAddress = this.app.session.get('ip');
        console.log(this.form);
        asynquence().or(fail)
            .then(validate)
            .then(post)
            .val(success);
    }
});
