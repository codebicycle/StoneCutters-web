'use strict';

var _ = require('underscore');
var url = require('url');
var asynquence = require('asynquence');
var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var Item = require('../../../../../../models/item');
var Chat = require('../../../../../../modules/chat');
var Metric = require('../../../../../../modules/metric');
var Validator = require('../../../../../../modules/validator');
var utils = require('../../../../../../../shared/utils');
var config = require('../../../../../../../shared/config');
var statsd = require('../../../../../../../shared/statsd')();
var Sixpack = require('../../../../../../../shared/sixpack');
var translations = require('../../../../../../../shared/translations');
var Mixpanel = require('../../../../../../modules/tracking/trackers/mixpanel');

module.exports = Base.extend({
    id: 'posting-view',
    tagName: 'main',
    locationFields: ['state', 'city', 'neighborhood'],
    selectors: {
        categories: '#posting-categories-view',
        title: '#posting-title-view',
        description: '#posting-description-view',
        price: '#posting-price-view',
        optionals: '#posting-optionals-view',
        contact: '#posting-contact-view',
        errors: '#posting-errors-view'
    },
    events: {
        'subcategorySubmit': onSubcategorySubmit,
        'fieldValidationRegister': onFieldValidationRegister,
        'fieldValidate': onFieldValidate,
        'fieldSubmit': onFieldSubmit,
        'fieldValidationStart': onFieldValidationStart,
        'fieldValidationEnd': onFieldValidationEnd,
        'submit': onSubmit,
        'error': onError,
        'updateErrors': onUpdateErrors,
        'showError': onShowError,
        'hideError': onHideError,
        'imagesLoadStart': onImagesLoadStart,
        'imagesLoadEnd': onImagesLoadEnd,
        'priceReset': onPriceReset,
        'focus .text-field': onFocusField,
        'blur .text-field': onFocusField
    },
    initialize: initialize,
    className: className,
    getTemplateData: getTemplateData,
    postRender: postRender,
    validateField: validateField,
    scrollSlideTo: scrollSlideTo,
    handleBack: handleBack,
    getVal: getVal,
    getItem: getItem,
    renderTemplate: renderTemplate,
    categorySuggestion: categorySuggestion,
    categorySuggestionGetCategory: categorySuggestionGetCategory,
    categorySuggestionDecideIU: categorySuggestionDecideIU,
    categorySuggestionBuildIU: categorySuggestionBuildIU,
    categorySuggestionMetric: categorySuggestionMetric,
    mixpanelTrack: mixpanelTrack
});

function initialize() {
    Base.prototype.initialize.call(this);
    this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
    this.pendingValidations = [];
    this.formErrors = [];
    this.errors = {};
    this.categorySuggestionConfig = config.get(['categorySuggestion'], {});
    this.validator = new Validator({}, {
        app: this.app
    });
}

function className() {
    var sixpackClass = this.app.sixpack.className(this.app.sixpack.experiments.growthCategorySuggestion);

    this.sixpackCurrentAlternative = this.app.sixpack.experiments.growthCategorySuggestion ? this.app.sixpack.experiments.growthCategorySuggestion.alternative : '';
    return 'posting-view' + (this.getItem().has('id') ? ' edition' : '') + (sixpackClass ? ' ' : '') + sixpackClass;
}

function getTemplateData() {
    var data = Base.prototype.getTemplateData.call(this);
    var customerContact = config.getForMarket(this.app.session.get('location').url, ['post_customer_contact'], '');
    var sixpackCurrentAlternative = this.app.sixpack.experiments.growthCategorySuggestion ? this.app.sixpack.experiments.growthCategorySuggestion.alternative : '';

    return _.extend({}, data, {
        item: this.getItem(data.item),
        customerContact: customerContact,
        chatEnabled: Chat.isEnabled.call(this),
        chatDepartment: Chat.getDepartment.call(this),
        experiments: this.getItem().has('id') || sixpackCurrentAlternative.indexOf('control') != -1 ? {} : this.app.sixpack.experiments
    });
}

function postRender() {
    var categoryId;
    var subcategoryId;
    var parentCategory;

    if (!isLandingMO() || !isComingFromFacebook()) {
        $(window).on('beforeunload', onBeforeUnload);
    }

    this.app.router.once('action:end', onStart);
    this.app.router.once('action:start', onEnd);

    this.pendingValidations = [];
    this.errors = {};
    this.formErrors = [];

    if (!this.metric) {
        this.metric = new Metric({}, {
            app: this.app
        });
    }

    this.editing = !!this.getItem().has('id');
    this.rebump = false;
    if (this.editing) {
        this.$(this.selectors.categories).trigger('editCategory', [this.item.get('category')]);
        this.$(this.selectors.contact).trigger('formRendered', [this.editing]);
        this.rebump = !!utils.getUrlParam('rb');
    }
    else {
        categoryId = utils.getUrlParam('cat');
        subcategoryId = utils.getUrlParam('subcat');
        if (categoryId || subcategoryId) {
            if (!categoryId) {
                parentCategory = this.app.dependencies.categories.search(subcategoryId);
                if (parentCategory) {
                    categoryId = parentCategory.get('parentId');
                }
            }
            if (categoryId) {
                this.$(this.selectors.categories).trigger('getQueryCategory', {
                    parentCategory: categoryId,
                    subCategory: subcategoryId
                });
            }
        }

        if (this.isValid === undefined || this.isValid === null) {
            this.$('[required]').each(function eachRequiredField(index, field) {
                this.errors[this.$(field).attr('name')] = this.dictionary['postingerror.PleaseCompleteThisField'];
            }.bind(this));
            this.errors['category.parentId'] = this.dictionary['postingerror.PleaseSelectCategory'];
            this.errors['category.id'] = this.dictionary['postingerror.PleaseSelectSubcategory'];
            this.errors.state = this.dictionary['posting_fields_1.location_select_level_2'] + ' ' + this.dictionary['posting_fields_1.location_level_2'];
            this.errors.city = this.dictionary['posting_fields_1.location_select_level_4'];
            this.errors.neighborhood = this.dictionary[(this.app.session.get('location').abbreviation == 'ZA') ? 'misc.SelectSuburb' : 'posting_fields_1.location_select_level_6'];
            this.$el.trigger('updateErrors');
            this.$(this.selectors.contact).trigger('formRendered');
        }
    }
    this.app.sixpack.convert(this.app.sixpack.experiments.dgdHomePage, 'funnel-posting-form');
}

function scrollSlideTo(element, value) {
    var $element = $(element);

    if (!$element.length) {
        return false;
    }
    return $('html, body').animate({
        scrollTop: $element.offset().top + (value ? value : 0)
    }, {
        queue: false,
        duration: 750
    });
}

function isLandingMO() {
    return window.location.pathname == '/posting/landing_mo';
}

function isComingFromFacebook() {
    var queryObject = url.parse(window.location.href,true).query;
    return queryObject.utm_source && queryObject.utm_source == 'facebook';
}

function handleBack() {
    if (!isLandingMO() || !isComingFromFacebook()) {
        this.edited = true;
        history.pushState(null, '', window.location.pathname + window.location.search);
        $(window).on('popstate', {
            message: this.dictionary['misc.WantToGoBack']
        }, onPopState);
    }
}

function getVal(field) {
    var $field = $(field);

    if ($field.attr('type') === 'checkbox') {
        return $field.is(':checked') ? $field.val() : '';
    }
    return $field.val();
}

function getItem(item) {
    this.item = this.item || (item && (item.toJSON ? item : new Item(item))) || (this.options.item && this.options.item.toJSON ? this.options.item : new Item(this.options.item || {}, {
        app: this.app
    }));
    return this.item;
}

function onSubcategorySubmit(event, subcategory) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (!subcategory.fields) {
        subcategory.fields = {
            categoryAttributes: [],
            productDescription: [],
            contactInformation: []
        };
    }

    this.item.get('category').parentId = subcategory.parentId;
    this.item.get('category').id = subcategory.id;
    if (subcategory.parentId) {
        delete this.errors['category.parentId'];
        delete this.errors['category.id'];
    }
    _.each(this.pendingValidations, function eachValidation($field) {
        $field.trigger('fieldValidationStart');
    });
    this.pendingValidations = [];
    this.$el.trigger('updateErrors');
    this.$(this.selectors.optionals).trigger('fieldsChange', [subcategory.fields.categoryAttributes]);
    this.$(this.selectors.price).trigger('fieldsChange', [subcategory.fields.productDescription]);
    this.$(this.selectors.contact).trigger('fieldsChange', [subcategory.fields.contactInformation]);
    if (!this.edited) {
        this.handleBack();
    }
    if (!this.editing) {
        Mixpanel.track.call(this, 'chooseCategory', {
            categoryId: this.item.get('category').id,
            categoryName: this.categorySuggestionGetCategory(this.item.get('category').id).subcategory.name
        });
    }
}

function onFieldValidationRegister(event, field, options, unregister) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (this.validator.isEnabled()) {
        this.validator.register(field, options, unregister);
    }
}

function onFieldValidate(event, field, options, done) {
    var $field;

    if (!this.validator.isEnabled()) {
        return done(true);
    }
    if (_.isFunction(options)) {
        done = options;
        options = {};
    }
    $field = $(field);
    this.validator.validate($field, options, callback.bind(this));

    function callback(err, isValid) {
        var details;

        if (err) {
            return done(false);
        }
        details = this.validator.details($field);

        this.$el.trigger('hideError', [$field]);
        if (details && details.length) {
            _.each(details, function eachDetails(detail) {
                this.$el.trigger('showError', [$field, detail, isValid]);
            }, this);
        }
        done(isValid);
    }
}

function onFieldSubmit(event, field, options) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var shouldValidateField = false;
    var validate = false;
    var $field;

    options = _.defaults({}, options || {}, {
        skipValidation: false,
        pendingValidation: false
    });

    if (field instanceof window.jQuery) {
        $field = field;
        shouldValidateField = !!$field.data('validate');
        validate = _.contains(this.locationFields, $field.attr('name'));
        field.name = $field.attr('name');
        field.value = this.getVal($field);
    }
    if (shouldValidateField) {
        validate = this.item.has('category');
        if (!validate) {
            this.pendingValidations.push($field);
        }
    }
    if (validate) {
        if (options.pendingValidation) {
            this.pendingValidations.push($field);
        }
        else if (!options.skipValidation) {
            $field.trigger('fieldValidationStart');
        }
        else {
            this.$el.trigger('hideError', [$field]);
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
}

function onFieldValidationStart(event) {
    var $field = $(event.target).addClass('validating');

    delete this.errors[$field.attr('name')];
    this.$el.trigger('hideError', [$field]);
    this.validateField($field);
}

function validateField($field) {
    var value = this.getVal($field);
    var _errors = [];
    var $category;
    var messages;
    var data;

    if (this.item.get('category').id === undefined || this.item.get('category').parentId === undefined) {
        $category = this.$('.posting-categories-list');
        messages = [this.dictionary["postingerror.PleaseSelectCategory"],this.dictionary["postingerror.PleaseSelectSubcategory"]];

        if (!$category.closest('.field-wrapper').hasClass('error')) {
            this.$el.trigger('showError', [$category, {
                message: messages[!$('.child-categories-list').is(':visible') ? 0 : 1]
            }]);
        }
        $field.removeClass('validating');
        this.scrollSlideTo(this.$el);
    }
    else if ($field.attr('required') && !value.trim().length && !$field.is(':disabled')) {
        _errors.push({
            selector: $field.attr('name'),
            message: this.dictionary["postingerror.PleaseCompleteThisField"]
        });
        $field.trigger('fieldValidationEnd', [_errors]);
    }
    else if (_.contains(this.locationFields, $field.attr('name'))) {
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
            $field.trigger('fieldValidationEnd', [body]);
        });
    }
}

function onFieldValidationEnd(event, _errors) {
    var $field = $(event.target).removeClass('validating');

    if (_errors) {
        _.each(_errors, function eachError(error) {
            this.errors[error.selector] = error.message;
            this.$el.trigger('showError', [$field, error]);
        }, this);
    }
    else {
        $field.closest('.field-wrapper').addClass('success');
    }
    this.$el.trigger('updateErrors');
}

function onSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.mixpanelTrack('postSubmitted');

    var promise = asynquence().or(fail.bind(this))
        .then(prepare.bind(this))
        .then(validate.bind(this));
        if (this.rebump) {
            promise.then(rebump.bind(this));
        }
        promise.then(post.bind(this))
        .val(success.bind(this));

    function prepare(done) {
        this.$(this.selectors.contact).trigger('disablePost');
        this.item.set('languageId', this.app.session.get('languageId'));
        this.item.set('platform', this.app.session.get('platform'));
        this.item.set('ipAddress', this.app.session.get('ip'));
        this.formErrors = [];
        done();
    }

    function check(done) {
        var errors = $('small.detail-message:not(.exclude)');

        if (errors.length) {
            done.abort();
            this.$(this.selectors.contact).trigger('enablePost');
            return this.scrollSlideTo(errors.first().parent(), -20);
        }
        done();
    }

    function validate(done) {
        var promise = asynquence(true).or(done.fail);

        validation.call(this, this.selectors.title);
        validation.call(this, this.selectors.description);
        validation.call(this, this.selectors.optionals);
        validation.call(this, this.selectors.contact);
        promise.then(check.bind(this));
        promise.val(done);

        function validation(view) {
            promise.then(function(next, result) {
                this.$(view).trigger('validate', [next, result]);
            }.bind(this));
        }
    }

    function rebump(done) {
        this.item.rebump(done);
    }

    function post(done) {
        this.item.post(done);
    }

    function success(done) {
        var category = 'Posting';
        var action = 'PostingSuccess';
        var successPage = this.editing ? '/edititem/success/' : '/posting/success/';

        this.$(this.selectors.contact).trigger('enablePost');

        this.track({
            category: category,
            action: action,
            custom: [category, this.item.get('category').parentId || '-', this.item.get('category').id || '-', action, this.item.get('id')].join('::')
        });

        this.app.sixpack.convert(this.app.sixpack.experiments.dgdHomePage, 'funnel-posting-success');
        this.app.sixpack.convert(this.app.sixpack.experiments.growthCategorySuggestion);
        this.categorySuggestionMetric(['post']);

        this.mixpanelTrack('postComplete', {
            itemId: this.item.get('id')
        });

        helpers.common.redirect.call(this.app.router, successPage + this.item.get('id') + '?sk=' + this.item.get('securityKey'), null, {
            status: 200
        });
    }

    function fail(errors) {
        this.$(this.selectors.contact).trigger('enablePost');

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
            if (this.errors && _.size(this.errors)) {
                this.formErrors.length = 0;
            }
            this.$el.trigger('error');
        }
    }
}

function onError(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var errorsSummary = _.clone(this.errors);
    var $field;
    var $error;

    this.$el.trigger('hideError');
    _.each(errorsSummary, function eachError(message, selector) {
        if (selector === 'category.id' || selector === 'category.parentId') {
            $field = this.$('.posting-categories-list');
        } else {
            $field = this.$('[name="' + selector + '"]');
        }

        if ($field.length) {
            delete errorsSummary[selector];
            this.$el.trigger('showError', [$field, {
                message: message
            }]);
        }
    }, this);
    this.scrollSlideTo($('small.detail-message:not(.exclude)').first().parent(), -20);
    this.$(this.selectors.errors).trigger('update');
}

function onUpdateErrors() {
    this.isValid = !(_.size(this.errors));
    this.$(this.selectors.errors).trigger('update');
}

function onShowError(event, field, options) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.$(this.selectors.errors).trigger('showError', Array.prototype.slice.call(arguments, 1));
    statsd.increment([this.app.session.get('location').abbreviation, 'posting', 'invalid', this.app.session.get('platform'), $(field).attr('name')]);
}

function onHideError(event, fields, context) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.$(this.selectors.errors).trigger('hideError', Array.prototype.slice.call(arguments, 1));
}

function onImagesLoadStart(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.$(this.selectors.contact).trigger('disablePost');
}

function onImagesLoadEnd(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.$(this.selectors.contact).trigger('enablePost');
}

function onPriceReset(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    _.each(['currency_type', 'priceC', 'priceType'], function clean(field) {
        this.item.unset(field);
        delete this.errors[field];
    }, this);
    this.$el.trigger('updateErrors');
}

function onFocusField(event) {
    $(event.currentTarget).closest('.field-wrapper').toggleClass('focus');
    if (!this.edited) {
        this.handleBack();
    }
}

function renderTemplate(tpl, data) {
    return _.template($(tpl).html(), data, {
        interpolate: /\{(.+?)\}/g
    });
}

function categorySuggestion(value) {
    if (!this.app.sixpack.experiments.growthCategorySuggestion || this.sixpackCurrentAlternative.indexOf('control') != -1 || this.editing) {
        return;
    }
    var $catSelector = $(this.selectors.categories + ' .posting-category-suggestion');
    var url = this.categorySuggestionConfig.api + this.app.session.get('location').url;

    $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        timeout: this.categorySuggestionConfig.timeout,
        cache: false,
        context: this,
        data: {
            title: value
        },
        beforeSend: beforeSend,
        success: success,
        complete: complete,
        error: error
    });

    function beforeSend() {
        $catSelector.addClass('loading');
    }

    function success(data) {
        var response = data.response.suggestions;

        this.categorySuggestionDecideIU(response);
        this.categorySuggestionMetric(['api', 'success', response.length]);
    }

    function complete() {
        $catSelector.removeClass('loading');
    }

    function error(result) {
        $catSelector.removeClass('loading');
        this.categorySuggestionMetric(['api', result.statusText]);
    }
}

function categorySuggestionGetCategory(id) {
    var categories = this.app.dependencies.categories;
    var category = {};
    var subcategory = {};
    var subcat;
    var cat;

    if (id) {
        subcat = categories.search(id);
        cat =  categories.get(subcat.attributes.parentId);
        if (subcat && cat) {
            category = {
                id: subcat.attributes.parentId,
                trName: cat.get('trName'),
                name: cat.get('name')
            };
            subcategory = {
                id: id,
                trName: subcat.get('trName'),
                name: subcat.get('name')
            };
        }
    }
    return {
        category: category,
        subcategory: subcategory
    };
}

function categorySuggestionDecideIU(response) {
    var cat;

    if (response.length > 0) {
        if (this.sixpackCurrentAlternative === 'single') {
            cat = this.categorySuggestionGetCategory(response[0].categoryId);
            if (cat.category) {
                $('#posting-categories-view').trigger('getQueryCategory', [{
                    parentCategory: cat.category.id,
                    subCategory: cat.subcategory.id
                }]);
                return this.categorySuggestionMetric(['on', 'autoselect']);
            }
        }
    }
    else {
        this.categorySuggestionMetric(['off']);
    }
    this.categorySuggestionBuildIU(response, true);
}

function categorySuggestionBuildIU(response, initial) {
    if (!this.app.sixpack.experiments.growthCategorySuggestion || this.sixpackCurrentAlternative.indexOf('control') != -1 || this.editing) {
        return;
    }

    var isSuggested = this.sixpackCurrentAlternative === 'suggested';
    var responseLength = response.length;
    var strHtml = '';
    var options = {
        classname: 'selected',
        buttontext: 'Cambiar categoría',
        action: 'change'
    };

    if (isSuggested && initial) {
        options = {
            classname: 'suggest',
            buttontext: 'Elegir esta categoría',
            action: 'select'
        };
    }

    _.each(response, function each(suggest, index){
        var category = this.categorySuggestionGetCategory(suggest.categoryId);

        strHtml += this.renderTemplate('#template-category', {
            classname: options.classname,
            categoryid: category.category.id,
            categoryname: category.category.trName,
            categorydata: category.category.id + ',' + category.subcategory.id,
            subcategoryname: category.subcategory.trName,
            buttontext: options.buttontext,
            action: options.action,
            index: ++index + '/' + responseLength
        });
    }, this);

    if (strHtml && isSuggested) {
        strHtml += this.renderTemplate('#template-other-categories', {
            total: responseLength
        });
    }

    $('#posting-categories-view .posting-categories-suggested').hide().html(strHtml).fadeIn().find('li a').on('click', {
        context: this
    }, function onClick(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var ctx = event.data.context;
        var $element = $(event.currentTarget);
        var action = $element.data('increment-action');
        var value = $element.data('increment-value');
        var cat;

        if (action === 'select') {
            cat = $element.data('category').split(',');
            $(ctx.selectors.categories).trigger('getQueryCategory', [{
                parentCategory: cat[0],
                subCategory: cat[1]
            }]);
        }
        else {
            $('.posting-categories-suggested').empty();
            $('.posting-categories-list').fadeIn();

            if (value.indexOf('others') < 0) {
                value = value.split('-')[0];
            }
        }
        ctx.categorySuggestionMetric(['on', 'user' + action, value]);
    });

    $('#posting-category-suggestion-button').toggle(!strHtml);
    $('.posting-categories-list').hide();
}

function categorySuggestionMetric(keys) {
    if (!this.app.sixpack.experiments.growthCategorySuggestion || this.editing || !keys) {
        return;
    }
    this.metric.increment(['growth', 'posting', ['abtest', 'category-suggestion', 'alternative-' + this.sixpackCurrentAlternative].concat(keys)]);
}

function onStart(event) {
    this.appView.trigger('posting:start');
}

function onEnd(event) {
    $(window).off('beforeunload', onBeforeUnload);
    $(window).off('popstate', onPopState);

    this.appView.trigger('posting:end');
}

function onBeforeUnload(event) {
    return ' ';
}

function onPopState(event) {
    var $loading = $('body > .loading');
    var status = ($loading.is(":visible")) ? false : confirm(event.data.message);

    if (status) {
        $(window).off('popstate', onPopState);
        history.back();
        return;
    }
    history.pushState(null, '', window.location.pathname + window.location.search);
}

function mixpanelTrack(prop, val) {
    if (this.editing) {
        return;
    }

    var values = {
        price: this.$('#field-priceC').val() || '',
        numberOfPhotos: this.item.get('images').length,
        categoryId: this.item.get('category').id || 0,
        categoryName: this.categorySuggestionGetCategory(this.item.get('category').id).subcategory.name || '',
        neighborhood: this.$('#field-neighborhood :selected[value!=""]').text() || '',
        tipo: this.$('#posting-optionals-view .field-wrapper:first-child select :selected[value!=""]').text() || '',
        location: this.$('#field-city :selected[value!=""]').text() || ''
    };
    if (val) {
        values = _.defaults(val, values);
    }

    Mixpanel.track.call(this, prop, values);
}

module.exports.id = 'post/index';
