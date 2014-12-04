'use strict';

var Base = require('../../../../../common/app/bases/view');
var Item = require('../../../../../../models/item');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');
var asynquence = require('asynquence');
var translations = require('../../../../../../../shared/translations');

function onpopstate(event) {
    var $loading = $('body > .loading');
    var status = ($loading.is(":visible")) ? false : confirm(event.data.message);

    if (status) {
        $(window).off('popstate', onpopstate);
        history.back();
    }
    else {
        history.pushState(null, '', window.location.pathname);
    }
}

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
        $(window).on('beforeunload', this.onBeforeUnload);
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
        if (!this.edited) {
            this.handleBack();
        }
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
        if (!this.edited) {
            this.handleBack();
        }
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
        if (!this.edited) {
            this.handleBack();
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
        if (!this.edited) {
            this.handleBack();
        }
    },
    handleBack: function() {
        this.edited = true;
        history.pushState(null, '', window.location.pathname);
        $(window).on('popstate', {
            message: this.dictionary['misc.WantToGoBack']
        }, onpopstate);
    },
    onFieldValidationStart: function(event) {
        var $field = $(event.target).addClass('validating');

        delete this.errors[$field.attr('name')];
        $field.siblings('.error.message').remove();
        this.validateField($field);
    },
    validateField: function($field) {
        var value = $field.val();
        var _errors = [];
        var data;

        if ($field.attr('required') && !value.trim().length) {
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
            data[$field.attr('name')] = value;
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
        this.form.images = Object.keys(images).map(function each(image) {
            return images[image].id;
        });
        this.$('#posting-contact-view').trigger((this.isValid) ? 'enablePost' : 'disablePost');
    },
    onBeforeUnload: function(event) {
        return ' ';
    },
    onEnd: function(event) {
        $(window).off('beforeunload', this.onBeforeUnload);
        $(window).off('popstate', onpopstate);
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

        var item;

        function post(done) {
            item = new Item(this.form, {
                app: this.app
            });
            item.post(done);
        }

        function success(response) {
            var category = 'Posting';
            var action = 'PostingSuccess';

            this.track({
                category: category,
                action: action,
                custom: [category, this.form['category.parentId'] || '-', this.form['category.id'] || '-', action, item.get('id')].join('::')
            });
            helpers.common.redirect.call(this.app.router, '/posting/success/' + item.get('id') + '?sk=' + item.get('securityKey'), null, {
                status: 200
            });
        }

        function fail(_errors, track) {
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
        }

        this.$('#posting-contact-view').trigger('disablePost');
        this.formErrors = [];
        this.form.languageId = this.app.session.get('languageId');
        this.form.platform = this.app.session.get('platform');
        this.form.ipAddress = this.app.session.get('ip');
        asynquence().or(fail.bind(this))
            .then(post.bind(this))
            .val(success.bind(this));
    }
});

module.exports.id = 'post/index';
