'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');
var asynquence = require('asynquence');
var translations = require('../../../../../../../shared/translations');

module.exports = Base.extend({
    tagName: 'main',
    id: 'posting-view',
    className: 'posting-view',
    form: {},
    pendingValidations: [],
    events: {
        'focus .text-field': 'fieldFocus',
        'blur .text-field': 'fieldFocus',
        'subcategorySubmit': 'onSubcategorySubmit',
        'fieldSubmit': 'onFieldSubmit',
        'imagesLoadEnd': 'onImagesLoadEnd',
        'submit': 'onSubmit',
        'fieldValidationStart': 'onFieldValidationStart',
        'fieldValidationEnd': 'onFieldValidationEnd'
    },
    initialize: function() {
        Base.prototype.initialize.call(this);
        this.form = {};
        this.pendingValidations = [];
        this.dictionary = translations[this.app.session.get('selectedLanguage') || 'en-US'] || translations['es-ES'];
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data);
    },
    fieldFocus: function(event) {
        $(event.currentTarget).closest('.wrapper').toggleClass('input-focus');
    },
    onSubcategorySubmit: function(event, subcategory) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (this.form['category.id'] === subcategory.id) {
            return;
        }
        this.form['category.parentId'] = subcategory.parentId;
        this.form['category.id'] = subcategory.id;

        _.each(this.pendingValidations, function eachValidation($field) {
            $field.trigger('fieldValidationStart');
        });

        this.pendingValidations = [];

        this.$('#posting-optionals-view').trigger('fieldsChange', [subcategory.fields.categoryAttributes, subcategory.parentId, subcategory.id, true]);
    },
    onFieldSubmit: function(event, field) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field;
        var shouldValidateField = false;
        var canValidateFields = this.form['category.id'] && this.form['category.parentId'];

        if (field instanceof window.jQuery) {
            $field = field;
            shouldValidateField = !!$field.data('validate');
            field.name = $field.attr('name');
            field.value = $field.val();
        }
        if (shouldValidateField) {
            if (canValidateFields) {
                $field.trigger('fieldValidationStart');
            }
            else {
                this.pendingValidations.push($field);
            }
        }
        if (field.value) {
            this.form[field.name] = field.value;
        }
        else {
            delete this.form[field.name];
        }
    },

    onFieldValidationStart: function(event) {
        var $field = $(event.target).addClass('validating');
        
        $field.siblings('.error.advice').remove();
        this.validateField($field);
    },
    onFieldValidationEnd: function(event, errors) {
        var $field = $(event.target).removeClass('validating');
        
        if (errors) {
            $field.closest('.wrapper').addClass('error').removeClass('success');
            _.each(errors, function eachError(error) {
                $field.after('<small class="advice error">' + error.message + '</small>');
            });
        }
        else {
            $field.closest('.wrapper').removeClass('error').addClass('success');
        }
    },
    validateField: function($field) {
        var data;
        var errors = [];

        if ($field.attr('required') && !$field.val().length) {
            errors.push({
                selector: $field.attr('name'),
                message: this.dictionary["postingerror.PleaseCompleteThisField"]
            });
            $field.trigger('fieldValidationEnd', [errors]);
        }
        else {
            data = {
                'category.id': this.form['category.id'],
                'category.parentId': this.form['category.parentId'],
                'location': this.app.session.get('location').url,
                'languageId': this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
            };
            
            data[$field.attr('name')] = $field.val();
            helpers.dataAdapter.post(this.app.req, '/items/fields/validate', {
                data: data
            }, function onResponse(response) {
                errors = response;
                $field.trigger('fieldValidationEnd', [errors]);
            });
        }
    },

    onImagesLoadEnd: function(event, images) {
        this.form._images = Object.keys(images).map(function each(image) {
            return images[image].id;
        });
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
            function callback(body, status, response) {
                if (status !== 'success') {
                    return done.fail(body);
                }
                if (body) {
                    done.abort();
                    return fail(body, 'invalid');
                }
                done();
            }

            query.intent = 'validate';
            helpers.dataAdapter.post(this.app.req, '/items', {
                query: query,
                data: this.form
            }, callback);
        }.bind(this);

        var post = function(done) {
            query.intent = 'create';
            helpers.dataAdapter.post(this.app.req, '/items', {
                query: query,
                data: this.form,
                done: done,
                fail: done.fail
            });
        }.bind(this);

        var fail = function(err, track) {
            // TODO: Improve error handling
            always();
            if (err) {
                if (err.responseText) {
                    err = JSON.parse(err.responseText);
                }
                if (_.isArray(err)) {
                    this.$el.trigger('errors', [err]);
                }
            }
            trackFail(track);
        }.bind(this);

        var trackFail = function() {
            var url = helpers.common.fullizeUrl('/analytics/graphite.gif', this.app);

            $.ajax({
                url: helpers.common.link(url, this.app, {
                    metric: 'post,error',
                    location: this.app.session.get('location').name,
                    error: track || 'error'
                }),
                cache: false
            });
        }.bind(this);

        var success = function(item) {
            var category = 'Posting';
            var action = 'PostingSuccess';

            this.track({
                category: category,
                action: action,
                custom: [category, this.form['category.parentId'] || '-', this.form['category.id'] || '-', action, item.id].join('::')
            });
            this.app.router.once('action:end', always);
            helpers.common.redirect.call(this.app.router, '/posting/success/' + item.id + '?sk=' + item.securityKey, null, {
                status: 200
            });
            track();
        }.bind(this);

        var track = function() {
            var url = helpers.common.fullizeUrl('/analytics/graphite.gif', this.app);

            $.ajax({
                url: helpers.common.link(url, this.app, {
                    metric: 'post,success',
                    location: this.app.session.get('location').name
                }),
                cache: false
            });
        }.bind(this);

        var always = function() {
            $loading.hide();
        }.bind(this);

        this.$('#errors').trigger('hide');

        if (user) {
            query.token = user.token;
        }
        this.form.languageId = this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id;
        this.form.platform = this.app.session.get('platform');
        this.form.ipAddress = this.app.session.get('ip');
        if (this.form._images) {
            this.form.images = this.form._images.join(',');
        }
        asynquence().or(fail)
            .then(validate)
            .then(post)
            .val(success);
    }
});

module.exports.id = 'post/index';
