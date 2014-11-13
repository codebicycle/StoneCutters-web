'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');
var asynquence = require('asynquence');
var statsd = require('../../../../../../../shared/statsd')();
var translations = require('../../../../../../../shared/translations');

module.exports = Base.extend({
    tagName: 'main',
    id: 'posting-view',
    className: 'posting-view',
    form: {},
    pendingValidations: [],
    errors: {},
    formErrors: [],
    events: {
        'focus .text-field': 'fieldFocus',
        'blur .text-field': 'fieldFocus',
        'subcategorySubmit': 'onSubcategorySubmit',
        'locationSubmit': 'onLocationSubmit',
        'fieldSubmit': 'onFieldSubmit',
        'imagesLoadStart': 'onImagesLoadStart',
        'imagesLoadEnd': 'onImagesLoadEnd',
        'submit': 'onSubmit',
        'fieldValidationStart': 'onFieldValidationStart',
        'fieldValidationEnd': 'onFieldValidationEnd',
        'errorsUpdate': 'onErrorsUpdate',
        'error': 'onError',
        'priceReset': 'onPriceReset'
    },
    initialize: function() {
        Base.prototype.initialize.call(this);
        this.form = {};
        this.pendingValidations = [];
        this.errors = {};
        this.formErrors = [];
        this.dictionary = translations[this.app.session.get('selectedLanguage') || 'en-US'];
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data);
    },
    postRender: function() {
        this.dictionary = translations[this.app.session.get('selectedLanguage') || 'en-US'];
        if (this.isValid === undefined || this.isValid === null) {
            if (!this.form['category.parentId']) {
                this.errors['category.parentId'] = this.dictionary["postingerror.PleaseSelectCategory"];
            }
            if (!this.form['category.id']) {
                this.errors['category.id'] = this.dictionary["postingerror.PleaseSelectSubcategory"];
            }
            if (!this.form.state) {
                this.errors.state = this.dictionary["countryoptions.Home_SelectState"];
            }
            if (!this.form.location) {
                this.errors.location = this.dictionary["countryoptions.Home_SelectCity"];
            }
            this.$('[required]').each(function eachRequiredField(index, field) {
                var $field = $(field);

                if ($field.attr('name') !== 'state' && $field.attr('name') !== 'location') {
                    this.errors[$field.attr('name')] = this.dictionary["postingerror.PleaseCompleteThisField"];
                }
            }.bind(this));
            this.$el.trigger('errorsUpdate');
            this.$('#posting-locations-view').trigger('formRendered');
        }
        this.app.router.once('action:end', this.onStart);
        this.app.router.once('action:start', this.onEnd);
    },
    fieldFocus: function(event) {
        $(event.currentTarget).closest('.field-wrapper').toggleClass('focus');
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
        delete this.errors['category.parentId'];
        delete this.errors['category.id'];
        _.each(this.pendingValidations, function eachValidation($field) {
            $field.trigger('fieldValidationStart');
        });
        this.pendingValidations = [];
        this.$el.trigger('errorsUpdate');
        this.$('#posting-optionals-view').trigger('fieldsChange', [subcategory.fields.categoryAttributes, subcategory.parentId, subcategory.id, true]);
        this.$('#posting-price-view').trigger('fieldsChange', [
            _.filter(subcategory.fields.productDescription, function each(field) {
                return !(field.name === 'title' || field.name === 'description');
            })
        ]);
    },
    onLocationSubmit: function(event, location) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (location) {
            this.form.location = location;
            delete this.errors.location;
            this.$el.trigger('errorsUpdate');
        }
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
            if ($field.attr('name') === 'state' || $field.attr('name') === 'location') {
                $field.trigger('fieldValidationStart');
            }
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

        delete this.errors[$field.attr('name')];
        $field.siblings('.error.message').remove();
        this.validateField($field);
    },
    validateField: function($field) {
        var data;
        var _errors = [];

        if ($field.attr('required') && !$field.val().length) {
            _errors.push({
                selector: $field.attr('name'),
                message: this.dictionary["postingerror.PleaseCompleteThisField"]
            });
            $field.trigger('fieldValidationEnd', [_errors]);
        }
        else if ($field.attr('name') == 'state' || $field.attr('name') == 'location') {
            $field.trigger('fieldValidationEnd');
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
            }, function onResponse(err, response, body) {
                _errors = body;
                $field.trigger('fieldValidationEnd', [_errors]);
            });
        }
    },
    onFieldValidationEnd: function(event, _errors) {
        var $field = $(event.target).removeClass('validating');

        if (_errors) {
            $field.closest('.field-wrapper').addClass('error').removeClass('success');
            _.each(_errors, function eachError(error) {
                this.errors[error.selector] = error.message;
                $field.parent().append('<small class="error message">' + error.message + '</small>');
            }.bind(this));
        }
        else {
            $field.closest('.field-wrapper').removeClass('error').addClass('success');
        }
        this.$el.trigger('errorsUpdate');
    },
    onErrorsUpdate: function() {
        this.isValid = !(_.size(this.errors));
        this.$('#posting-contact-view').trigger((this.isValid) ? 'enablePost' : 'disablePost');
        this.$('#posting-errors-view').trigger('update');
    },
    onImagesLoadStart: function(event) {
        this.$('#posting-contact-view').trigger('disablePost');
    },
    onImagesLoadEnd: function(event, images) {
        this.form._images = Object.keys(images).map(function each(image) {
            return images[image].id;
        });
        this.$('#posting-contact-view').trigger((this.isValid) ? 'enablePost' : 'disablePost');
    },
    onEnd: function(event) {
        this.appView.trigger('posting:end');
    },
    onStart: function(event) {
        this.appView.trigger('posting:start');
    },
    onError: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field;
        var errorsSummary = _.clone(this.errors);

        _.each(errorsSummary, function eachError(message, selector) {

            if (selector === 'category.id' || selector === 'category.parentId') {
                $field = this.$('.posting-categories-list');
            } else {
                $field = this.$('[name="' + selector + '"]');
            }

            if ($field.length) {
                delete errorsSummary[selector];
                $field.closest('.field-wrapper').addClass('error').removeClass('success');
                $field.parent().append('<small class="error message">' + message + '</small>');
            }
        }.bind(this));
        this.$('#posting-errors-view').trigger('update');
    },
    onPriceReset: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        _.each(['currency_type', 'priceC', 'priceType'], function clean(field) {
            delete this.form[field];
            delete this.errors[field];
        }.bind(this));
        this.$el.trigger('errorsUpdate');
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var query = {
            postingSession: this.options.postingsession
        };
        var user = this.app.session.get('user');

        var validate = function(done) {
            query.intent = 'validate';
            helpers.dataAdapter.post(this.app.req, '/items', {
                query: query,
                data: this.form
            }, done);
        }.bind(this);

        var check = function(done, err, response, body) {
            if (response.status !== 'success') {
                return done.fail(body);
            }
            if (body) {
                done.abort();
                return fail(body, 'invalid');
            }
            done();
        }.bind(this);

        var post = function(done) {
            query.intent = 'create';
            helpers.dataAdapter.post(this.app.req, '/items', {
                query: query,
                data: this.form
            }, done.errfcb);
        }.bind(this);

        var trackEvent = function(done, res, item) {
            var category = 'Posting';
            var action = 'PostingSuccess';

            this.track({
                category: category,
                action: action,
                custom: [category, this.form['category.parentId'] || '-', this.form['category.id'] || '-', action, item.id].join('::')
            });
            done(item);
        }.bind(this);

        var trackGraphite = function(done, res, item) {
            var location = this.app.session.get('location');
            var platform = this.app.session.get('platform');

            statsd.increment([location.name, 'posting', 'success', platform]);
            done(item);
        }.bind(this);

        var success = function(item) {
            helpers.common.redirect.call(this.app.router, '/posting/success/' + item.id + '?sk=' + item.securityKey, null, {
                status: 200
            });
        }.bind(this);

        var fail = function(_errors, track) {
            // TODO: Improve error handling
            if (_errors) {
                if (_errors.responseText) {
                    _errors = JSON.parse(_errors.responseText);
                }
                if (_.isArray(_errors)) {
                    _.each(_errors, function eachError(error) {
                        if (error.selector === 'main') {
                            this.formErrors.push(error.message);
                        } else {
                            if (error.selector === 'price') {
                                error.selector = 'priceC';
                            }
                            this.errors[error.selector] = error.message;
                        }
                    }.bind(this));
                }
                else {
                    this.formErrors.push('Unkown error'); // Translate this
                }
                this.$el.trigger('error');
            }
            trackFail(track);
        }.bind(this);

        var trackFail = function(track) {
            var location = this.app.session.get('location');
            var platform = this.app.session.get('platform');

            statsd.increment([location.name, 'posting', track || 'error', platform]);
        }.bind(this);

        this.$('#posting-contact-view').trigger('disablePost');
        this.formErrors = [];
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
            .then(check)
            .then(post)
            .gate(trackEvent, trackGraphite)
            .val(success);
    }
});

module.exports.id = 'post/index';
