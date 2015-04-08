'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../common/app/bases/view');
var Item = require('../../../../../../models/item');
var Chat = require('../../../../../../modules/chat');
var helpers = require('../../../../../../helpers');
var translations = require('../../../../../../../shared/translations');
var config = require('../../../../../../../shared/config');
var utils = require('../../../../../../../shared/utils');
var Sixpack = require('../../../../../../../shared/sixpack');
var Metric = require('../../../../../../modules/metric');

function onpopstate(event) {
    var $loading = $('body > .loading');
    var status = ($loading.is(":visible")) ? false : confirm(event.data.message);

    if (status) {
        $(window).off('popstate', onpopstate);
        history.back();
    }
    else {
        history.pushState(null, '', window.location.pathname + window.location.search);
    }
}

module.exports = Base.extend({
    tagName: 'main',
    id: 'posting-view',
    className: function() {
        this.sixpack = new Sixpack({
            platform: this.app.session.get('platform'),
            market: this.app.session.get('location').abbreviation,
            experiments: this.app.session.get('experiments')
        });
        this.sixpack.currentAlternative = this.sixpack.experiments.desktopCategorySelector ? this.sixpack.experiments.desktopCategorySelector.alternative : '';

        var sixpackClass = this.sixpack.className(this.sixpack.experiments.desktopCategorySelector);

        return 'posting-view' + (this.getItem().has('id') ? ' edition' : '') + (sixpackClass ? ' ' : '') + sixpackClass;
    },
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
        'errorClean': 'onErrorClean',
        'priceReset': 'onPriceReset'
    },
    initialize: function() {
        Base.prototype.initialize.call(this);
        this.pendingValidations = [];
        this.errors = {};
        this.formErrors = [];
        this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
        this.categorySelectorConfig = config.get(['categoryselector'], {});
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var location = this.app.session.get('location');
        var customerContact = config.getForMarket(location.url, ['post_customer_contact'], '');
        var sixpack = new Sixpack({
            platform: this.app.session.get('platform'),
            market: this.app.session.get('location').abbreviation,
            experiments: this.app.session.get('experiments')
        });
        var currentAlternative = sixpack.experiments.desktopCategorySelector ? sixpack.experiments.desktopCategorySelector.alternative : '';

        return _.extend({}, data, {
            item: this.getItem(data.item),
            customerContact: customerContact,
            chatEnabled: Chat.isEnabled.call(this),
            experiments: this.getItem().has('id') || currentAlternative === 'control' ? {} : sixpack.experiments
        });
    },
    postRender: function() {
        var paramCategory;

        this.pendingValidations = [];
        this.errors = {};
        this.formErrors = [];
        $(window).on('beforeunload', this.onBeforeUnload);
        this.editing = !!this.getItem().has('id');
        if (this.editing) {
            this.$('#posting-categories-view').trigger('editCategory', [this.item.get('category')]);
            this.$('#posting-contact-view').trigger('formRendered');
            this.$('#posting-locations-view').trigger('formRendered');
        }
        else {
            if (utils.getUrlParam('cat') !== undefined || utils.getUrlParam('subcat')  !== undefined) {
                var parentCategoryId =  utils.getUrlParam('cat');
                var subCategoryId = utils.getUrlParam('subcat');

                if( parentCategoryId === undefined ) {
                    var categories = this.app.dependencies.categories;
                    var subCategory = categories.search(subCategoryId);

                    parentCategoryId = subCategory.attributes.parentId;
                }
                paramCategory = {
                    parentCategory: parentCategoryId,
                    subCategory: subCategoryId
                };
                this.$('#posting-categories-view').trigger('getQueryCategory', paramCategory);
            }
            this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
            if (this.isValid === undefined || this.isValid === null) {
                this.errors['category.parentId'] = this.dictionary["postingerror.PleaseSelectCategory"];
                this.errors['category.id'] = this.dictionary["postingerror.PleaseSelectSubcategory"];
                this.errors.state = this.dictionary["countryoptions.Home_SelectState"];
                this.errors.location = this.dictionary["countryoptions.Home_SelectCity"];
                this.$('[required]').each(function eachRequiredField(index, field) {
                    var $field = $(field);

                    if ($field.attr('name') !== 'state' && $field.attr('name') !== 'location') {
                        this.errors[$field.attr('name')] = this.dictionary["postingerror.PleaseCompleteThisField"];
                    }
                }.bind(this));
                this.$el.trigger('errorsUpdate');
                this.$('#posting-contact-view').trigger('formRendered');
                this.$('#posting-locations-view').trigger('formRendered');
            }
        }
        this.app.router.once('action:end', this.onStart);
        this.app.router.once('action:start', this.onEnd);

        if (!this.metric) {
            this.metric = new Metric({}, {
                app: this.app
            });
        }
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

        var field = _.find(subcategory.fields.contactInformation, function each(field) {
            return field.name === 'email';
        });
        var email = field.value ? field.value.value : '';

        this.item.get('category').parentId = subcategory.parentId;
        this.item.get('category').id = subcategory.id;
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
        if (email) {
            this.$('#posting-contact-view').trigger('fieldsChange', [email]);
        }
        if (!this.edited) {
            this.handleBack();
        }
    },
    onLocationSubmit: function(event, location) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (location) {
            this.item.set('location', location);
            delete this.errors.location;
            this.$el.trigger('errorsUpdate');
        }
        if (!this.edited) {
            this.handleBack();
        }
    },
    onFieldSubmit: function(event, field, options) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field;
        var shouldValidateField = false;
        var canValidateFields = this.item.has('category');

        options = _.defaults({}, options || {}, {
            skipValidation: false,
            pendingValidation: false
        });

        if (field instanceof window.jQuery) {
            $field = field;
            shouldValidateField = !!$field.data('validate');
            if ($field.attr('name') === 'state' || $field.attr('name') === 'location' || $field.attr('name') === 'neighborhood') {
                if (options.pendingValidation) {
                    this.pendingValidations.push($field);
                }
                else if (!options.skipValidation) {
                    $field.trigger('fieldValidationStart');
                }
                else {
                    this.$el.trigger('errorClean', [$field]);
                }
            }
            field.name = $field.attr('name');
            field.value = this.getValue($field);
        }
        if (shouldValidateField) {
            if (canValidateFields) {
                if (options.pendingValidation) {
                    this.pendingValidations.push($field);
                }
                else if (!options.skipValidation) {
                    $field.trigger('fieldValidationStart');
                }
                else {
                    this.$el.trigger('errorClean', [$field]);
                }
            }
            else {
                this.pendingValidations.push($field);
            }
        }
        if (field.value) {
            this.item.set(field.name, field.value);
        }
        else {
            this.item.unset(field.name);
        }
        if (!this.edited) {
            this.handleBack();
        }
    },
    getValue: function(ele) {
        if (ele[0].type !== 'checkbox') {
            return ele[0].value;
        }
        return ele[0].checked ? ele[0].value : '';
     },
    handleBack: function() {
        this.edited = true;
        history.pushState(null, '', window.location.pathname + window.location.search);
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

        if (this.item.get('category').id === undefined || this.item.get('category').parentId === undefined) {
            var $fieldCat = this.$('.posting-categories-list');
            var messages = [this.dictionary["postingerror.PleaseSelectCategory"],this.dictionary["postingerror.PleaseSelectSubcategory"]];

            if (!$fieldCat.closest('.field-wrapper').hasClass('error')) {
                $fieldCat.closest('.field-wrapper').addClass('error').removeClass('success');
                $fieldCat.parent().append('<small class="error message">' + messages[!$('.child-categories-list').is(':visible') ? 0 : 1] + '</small>');
            }
            $field.removeClass('validating');
            $('html, body').animate({
                scrollTop: this.$el.offset().top
            }, 750);
        } else {

            if ($field.attr('required') && !value.trim().length) {
                _errors.push({
                    selector: $field.attr('name'),
                    message: this.dictionary["postingerror.PleaseCompleteThisField"]
                });
                $field.trigger('fieldValidationEnd', [_errors]);
            }
            else if ($field.attr('name') === 'state' || $field.attr('name') === 'location' || $field.attr('name') === 'neighborhood') {
                $field.trigger('fieldValidationEnd');
            }
            else {
                data = {
                    'category.id': this.item.get('category').id,
                    'category.parentId': this.item.get('category').parentId,
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
        this.$('#posting-errors-view').trigger('update');
    },
    onImagesLoadStart: function(event) {
        this.$('#posting-contact-view').trigger('disablePost');
    },
    onImagesLoadEnd: function(event) {
        this.$('#posting-contact-view').trigger('enablePost');
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

        var errorsSummary = _.clone(this.errors);
        var $field;
        var $error;

        $('small.error.message:not(.exclude)').each(function eachErrors() {
            $error = $(this);
            $error.parent().find('.error').removeClass('error');
            $error.remove();
        });
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
        $('html, body').animate({
            scrollTop: $('small.error.message').first().parent().offset().top - 20
        }, 750);
        this.$('#posting-errors-view').trigger('update');
    },
    onErrorClean: function(event, field) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = $(field);

        $field.closest('.field-wrapper').removeClass('error success');
        $field.parent().find('small.error.message').remove();
    },
    onPriceReset: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        _.each(['currency_type', 'priceC', 'priceType'], function clean(field) {
            this.item.unset(field);
            delete this.errors[field];
        }.bind(this));
        this.$el.trigger('errorsUpdate');
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('#posting-contact-view').trigger('disablePost');
        this.formErrors = [];
        this.item.set('languageId', this.app.session.get('languageId'));
        this.item.set('platform', this.app.session.get('platform'));
        this.item.set('ipAddress', this.app.session.get('ip'));

        asynquence().or(fail.bind(this))
            .then(check.bind(this))
            .then(validate.bind(this))
            .then(post.bind(this))
            .val(success.bind(this));

        function check(done) {
            var errors = $('small.error.message:not(.exclude)');

            if (errors.length) {
                done.abort();
                this.$('#posting-contact-view').trigger('enablePost');
                return $('html, body').animate({
                    scrollTop: errors.first().parent().offset().top - 20
                }, 750);
            }
            done();
        }

        function validate(done) {
            var promise = asynquence(true).or(done.fail);

            validation.call(this, '#posting-description-view');
            validation.call(this, '#posting-title-view');
            promise.then(check.bind(this));
            promise.val(done);

            function validation(view) {
                promise.then(function(next, result) {
                    this.$(view).trigger('validate', [next, result]);
                }.bind(this));
            }
        }

        function post(done) {
            this.item.post(done);
        }

        function success(done) {
            var category = 'Posting';
            var action = 'PostingSuccess';
            var successPage = this.editing ? '/edititem/success/' : '/posting/success/';

            this.$('#posting-contact-view').trigger('enablePost');

            this.track({
                category: category,
                action: action,
                custom: [category, this.item.get('category').parentId || '-', this.item.get('category').id || '-', action, this.item.get('id')].join('::')
            });

            helpers.common.redirect.call(this.app.router, successPage + this.item.get('id') + '?sk=' + this.item.get('securityKey'), null, {
                status: 200
            });
        }

        function fail(errors) {
            this.$('#posting-contact-view').trigger('enablePost');

            // TODO: Improve error handling
            if (errors) {
                if (errors.responseText) {
                    errors = JSON.parse(errors.responseText);
                }
                if (_.isArray(errors)) {
                    _.each(errors, function eachError(error) {
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
                if (this.errors && _.size(this.errors)) {
                    this.formErrors.length = 0;
                }
                this.$el.trigger('error');
            }
        }
    },
    getItem: function(item) {
        this.item = this.item || (item && (item.toJSON ? item : new Item(item))) || (this.options.item && this.options.item.toJSON ? this.options.item : new Item(this.options.item || {}, {
            app: this.app
        }));
        return this.item;
    },
    categorySelector: function(value) {
        if (!this.sixpack.experiments.desktopCategorySelector || this.sixpack.currentAlternative === 'control' || this.editing) {
            return;
        }
        var $catSelector = $('#posting-categories-view .posting-category-selector');

        $.ajax({
            type: 'GET',
            url: this.categorySelectorConfig.api,
            dataType: 'json',
            timeout: this.categorySelectorConfig.timeout,
            cache: false,
            context: this,
            data: {
                title: value
            },
            beforeSend: function onBeforeSend() {
                $catSelector.addClass('loading');
            },
            success: function onSuccess(data) {
                this.categorySelectorDecideIU(data.response.suggestions);
            },
            complete: function onComplete() {
                $catSelector.removeClass('loading');
            },
            error: function onError(result) {
                $catSelector.removeClass('loading');
                this.categorySelectorTrack('api-error');
            }
        });
    },
    categorySelectorGetCategory: function(id) {
        var categories = this.app.dependencies.categories;
        var cat;
        var subcat;
        var category = {};
        var subcategory = {};

        if (id) {
            subcat = categories.search(id);
            cat =  categories.get(subcat.attributes.parentId);
            if (subcat && cat) {
                category = {
                    id: subcat.attributes.parentId,
                    name: cat.get('trName')
                };
                subcategory = {
                    id: id,
                    name: subcat.get('trName')
                };
            }
        }
        return {
            category: category,
            subcategory: subcategory
        };
    },
    categorySelectorDecideIU: function(response) {
        var cat;
        if (response.length>0) {
            if (this.sixpack.currentAlternative === 'single' || response.length === 1) {
                cat = this.categorySelectorGetCategory(response[0].categoryId);
                if (cat.category) {
                    $('#posting-categories-view').trigger('getQueryCategory', [{
                        parentCategory: cat.category.id,
                        subCategory: cat.subcategory.id
                    }]);
                    return;
                }
            }
        }
        this.categorySelectorBuildIU(response);
    },
    categorySelectorBuildIU: function(response) {
        if (!this.sixpack.experiments.desktopCategorySelector || this.sixpack.currentAlternative === 'control' || this.editing) {
            return;
        }

        var strHtml = '';
        var tpl = '<li class="icons icon-cat-{categoryId} {classname}"><span>{subcatename}<br><small>en {catename}</small></span> <a href="#" data-category="{dataCategory}" data-action="{dataAction}" data-track="cat-option-{index}">{buttontext}</a></li>';
        var tplMore = '<li class="{classname}"><a href="#" data-action="{dataAction}" data-track="cat-others">{text}</a></li>';
        var options = {};

        if (response.length === 1) {
            options = {
                classname: 'selected',
                buttontext: 'Cambiar categoría',
                action: 'Change'
            };
        }
        else {
            options = {
                classname: 'suggest',
                buttontext: 'Elegir esta categoría',
                action: 'Choose',
                more: {
                    classname: 'more',
                    text: 'Elegir entre todas las categorías',
                    action: 'Change'
                }
            };
        }

        _.each(response, function(suggest, index){
            var category = this.categorySelectorGetCategory(suggest.categoryId);

            strHtml += tpl.replace('{categoryId}', category.category.id)
            .replace('{classname}', options.classname)
            .replace('{subcatename}', category.subcategory.name)
            .replace('{catename}', category.category.name)
            .replace('{buttontext}', options.buttontext)
            .replace('{dataCategory}', category.category.id + ',' + category.subcategory.id)
            .replace('{dataAction}', options.action)
            .replace('{index}', ++index);
        }, this);

        if (strHtml) {
            if (options.more) {
                strHtml += tplMore.replace('{classname}', options.more.classname)
                .replace('{text}', options.more.text)
                .replace('{dataAction}', options.more.action);
            }
            $('.posting-categories-list').hide();
        }

        $('#posting-categories-view .posting-categories-suggested').html(strHtml).find('li a').on('click', { context: this }, function(event) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            var cat;
            var $this = event.data.context;
            var $element = $(event.currentTarget);
            var track = $element.data('track');

            if ($element.data('action') === 'Choose') {
                cat = $element.data('category').split(',');
                $('#posting-categories-view').trigger('getQueryCategory', [{
                    parentCategory: cat[0],
                    subCategory: cat[1]
                }]);
            }
            else {
                $('.posting-categories-suggested').empty();
                $('.posting-categories-list').show();
            }
            $this.categorySelectorConvertion(track);
        });

        $('#posting-category-selector-button').toggle(!strHtml);
    },
    categorySelectorConvertion: function(key) {
        this.sixpack.convert(this.sixpack.experiments.desktopCategorySelector, key);
    },
    categorySelectorTrack: function(key) {
        this.metric.increment(['growth', 'posting', ['category-selector', key]]);
    }
});

module.exports.id = 'post/index';
