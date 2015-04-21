'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view');
var Mailgun = require('../../../../../../modules/validator/models/mailgun');
var Metric = require('../../../../../../modules/metric');
var translations = require('../../../../../../../shared/translations');

module.exports = Base.extend({
    id: 'posting-contact-email-view',
    tagName: 'section',
    className: 'posting-contact-email-view-view',
    selector: '#field-email',
    events: {
        'change': onChange,
        'validate': onValidate,
        'formRendered': onFormRendered,
        'blur [name="email"]': onBlur,
        'click .did-you-mean': onClickDidYouMean
    },
    initialize: initialize,
    postRender: postRender
});

function initialize() {
    Base.prototype.initialize.call(this);
    this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
}

function postRender() {
    var $field = this.$(this.selector);

    if (!this.metric) {
        this.metric = new Metric({}, {
            app: this.app
        });
    }

    if (Mailgun.isEnabled(this.app)) {
        this.parentView.$el.trigger('fieldValidationRegister', [$field, {
            rules: [{
                id: 'mailgun',
                message: 'postingerror.InvalidEmail',
                messageDidYouMean: '¿Has querido decir <a href="#">{ did_you_mean }</a>?',
                mailgun: new Mailgun({
                    element: $field
                }, {
                    app: this.app
                })
            }]
        }, true]);
    }
}

function onChange(event, options) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    var $field = $(event.currentTarget);

    if (_.isString(options)) {
        $field.val(options);
        options = undefined;
    }
    if (!Mailgun.isEnabled(this.app)) {
        this.parentView.$el.trigger('fieldSubmit', [$field, options]);
    }
}

function onValidate(event, done, isValid) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var $field = this.$(this.selector);

    this.parentView.$el.trigger('fieldValidate', [$field, function onComplete(isValidEmail) {
        done(isValid && isValidEmail);
    }]);
}

function onFormRendered(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var $field = this.$(this.selector);
    var category = this.parentView.getItem().get('category');
    var options = {
        pendingValidation: (category.id === undefined || category.parentId === undefined)
    };

    if ($field.val()) {
        $field.trigger('change', [options]);
    }
}

function onBlur(event) {
    var $field = this.$(event.currentTarget);
    var value = $field.val();
    var category = this.parentView.getItem().get('category');
    var options = {
        pendingValidation: (category.id === undefined || category.parentId === undefined)
    };
    
    if ($field.data('value') !== value) {
        if (!value) {
            return this.parentView.$el.trigger('fieldSubmit', [$field, options]);
        }
        this.parentView.$el.trigger('fieldValidate', [$field, $.noop, {
            progress: onValidateProgress.bind(this),
            success: onValidateSuccess.bind(this),
            error: onValidateError.bind(this),
            always: onValidateAlways.bind(this)
        }]);
        $field.data('value', value);
    }
}

function onClickDidYouMean(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var $field = this.$(this.selector);
    var $didYouMean = $(event.currentTarget);
    
    if (this.$('small.message.exclude').length) {
        $field.parent().find('small.message.exclude').remove();
    }

    $field.val($didYouMean.data('content'));
    $field.trigger('blur');
    this.metric.increment(['growth', 'posting', ['mailgun', 'didyoumean']]);
}

function onValidateProgress() {
    var $field = this.$(this.selector).addClass('validating');

    this.parentView.$el.trigger('hideError', [$field]);
}

function onValidateSuccess(data) {
    var $field = this.$(this.selector);
    var category = this.parentView.getItem().get('category');
    var options = {
        pendingValidation: (category.id === undefined || category.parentId === undefined),
        skipValidation: true
    };

    this.$('.did-you-mean').remove();
    if (!data.is_valid) {
        $field.trigger('fieldValidationEnd', []);
    }
    else {
        this.parentView.$el.trigger('fieldSubmit', [$field, options]);
    }/*
    if (data.did_you_mean) {
        $field.parent().append('<small class="' + isError + ' message did-you-mean" data-content="' + data.did_you_mean + '">¿Has querido decir <a href="#">' + data.did_you_mean + '</a>?</small>');
    }*/
    this.metric.increment(['growth', 'posting', ['validation', 'mailgun', data.is_valid ? 'success' : 'error']]);
}

function onValidateError() {
    var $field = this.$(this.selector);
    var category = this.parentView.getItem().get('category');
    var options = {
        pendingValidation: (category.id === undefined || category.parentId === undefined),
        skipValidation: true
    };

    this.parentView.$el.trigger('fieldSubmit', [$field, options]);
    this.metric.increment(['growth', 'posting', ['mailgun', 'apierror']]);
}

function onValidateAlways() {
    this.$(this.selector).removeClass('validating');
}

module.exports.id = 'post/email';
