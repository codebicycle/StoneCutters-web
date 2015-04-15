'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view');
var config = require('../../../../../../../shared/config');
var EmailValidator = require('../../../../../../modules/emailValidator');
var Metric = require('../../../../../../modules/metric');
var helpers = require('../../../../../../helpers');
var translations = require('../../../../../../../shared/translations');

module.exports = Base.extend({
    tagName: 'section',
    id: 'posting-contact-view',
    className: 'posting-contact-view',
    events: {
        'change': 'onChange',
        'disablePost': 'onDisablePost',
        'enablePost': 'onEnablePost',
        'click [data-modal-close]': 'onCloseModal',
        'click .open-modal': 'onOpenModal',
        'click [data-modal-shadow]': 'onCloseModal',
        'change [name="phone"]': 'onPhoneChange',
        'fieldsChange': 'onFieldsChange',
        'formRendered': 'onFormRendered',
        'blur [name="email"]': 'onBlurEmail',
        'click .did-you-mean': 'fillEmail',
        'validate': 'onValidate'
    },
    initialize: function() {
        Base.prototype.initialize.call(this);
        this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var locationUrl = this.app.session.get('location').url;
        var isPhoneMandatory = config.getForMarket(locationUrl, ['validator', 'phone', 'enabled'], false);

        return _.extend({}, data, {
            isPhoneMandatory: isPhoneMandatory
        });
    },
    postRender: function() {
        if (!this.metric) {
            this.metric = new Metric({}, {
                app: this.app
            });
        }
    },
    onValidate: function(event, done, isValid) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.validate(success.bind(this), this.$('[name="email"]'));

        function success(isValidEmail) {
            var isValidPhone = validatePhone.call(this);
            done(isValid && isValidEmail && isValidPhone);
        }

        function validatePhone() {
            var locationUrl = this.app.session.get('location').url;
            var isPhoneMandatory = config.getForMarket(locationUrl, ['validator', 'phone', 'enabled'], false);
            var isValidPhone = true;
            var $field = this.$('[name="phone"]');

            if (isPhoneMandatory && $field.val() === '') {
                isValidPhone = false;
                $field.closest('.field-wrapper').addClass('error').removeClass('success');
                $field.parent().find('.error.message').remove();
                $field.parent().append('<small class="error message">' + this.dictionary['postingerror.PleaseCompleteThisField'] + '</small>');
            }
            return isValidPhone;
        }
    },
    onPhoneChange: function(event) {
        var $phone = $(event.target);

        $phone.val($phone.val().replace(/[^\d]/gi, ''));
    },
    onChange: function(event, options) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        var $field = $(event.target);
        var locationUrl = this.app.session.get('location').url;
        var isMailgunEnabled = config.getForMarket(locationUrl, ['validator', 'email', 'enabled'], false);

        if ($field.attr('name') !== 'email' || !isMailgunEnabled) {
            this.parentView.$el.trigger('fieldSubmit', [$field, options]);
        }
    },
    onDisablePost: function(event) {
        this.$('.posting').attr('disabled', 'disabled');
    },
    onEnablePost: function(event) {
        this.$('.posting').removeAttr('disabled');
    },
    onOpenModal: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        $('#modal-terms-view').trigger('show');
    },
    onCloseModal: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        $('#modal-terms-view').trigger('hide');
    },
    onFieldsChange: function(event, email) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('[name="email"]').val(email).trigger('change');
    },
    onFormRendered: function(event) {
        var $email = this.$('[name="email"]');
        var category = this.parentView.getItem().get('category');
        var options = {
            pendingValidation: (category.id === undefined || category.parentId === undefined)
        };

        if ($email.val()) {
            $email.trigger('change', [options]);
        }
    },
    onBlurEmail: function() {
        var locationUrl = this.app.session.get('location').url;
        var $field = this.$('[name="email"]');
        var value = $field.val();
        
        if ($field.data('value') !== value) {   
            if (config.getForMarket(locationUrl, ['validator', 'email', 'enabled'], false)) {
                var currentPage = this.editing ? 'editing' : 'posting';

                if (!value) {
                    var category = this.parentView.getItem().get('category');
                    var options = {
                        pendingValidation: (category.id === undefined || category.parentId === undefined),
                    };

                    return this.parentView.$el.trigger('fieldSubmit', [$field, options]);
                }
                this.validate($.noop, $field);
                $field.data('value', value);
            }
        }
    },
    validate: function(done, $field) {
        var currentPage = this.editing ? 'editing' : 'posting';

        if (this.emailValid) {
            this.emailValid = null;
        }
        this.emailValid = new EmailValidator({
            element: $field,
            currentPage: currentPage
        }, {
            app: this.app
        });

        if (this.emailValid.isEnabled() && $field.val()) {
            this.emailValid.run({
                progress: this.inProgressValidation.bind(this),
                always: this.alwaysValidation.bind(this),
                success: success.bind(this),
                error: error.bind(this)
            });
        }
        else {
            return done(true);
        }

        function success(data) {
            done(data.is_valid);
            this.successValidation(data);
        }

        function error() {
            this.validationError();
            done(true);
        }
    },
    inProgressValidation: function() {
        var $field = this.$('[name="email"]').addClass('validating');

        delete this.parentView.errors[$field.attr('name')];
        $field.siblings('.error.message').remove();
    },
    alwaysValidation: function() {
        this.$('[name="email"]').removeClass('validating');
    },
    successValidation: function (data) {
        var $field = this.$('[name="email"]');
        var category = this.parentView.getItem().get('category');
        var options = {
            pendingValidation: (category.id === undefined || category.parentId === undefined),
            skipValidation: true
        };
        var isError = '';
        
        this.$('.did-you-mean').remove();

        if (!data.is_valid) {
            isError = 'error';

            $field.trigger('fieldValidationEnd', []);
            $field.closest('.field-wrapper').addClass('error').removeClass('success');

            if (!data.did_you_mean) {
                $field.parent().find('.error.message').remove();
                $field.parent().append('<small class="error message">' + this.dictionary["postingerror.InvalidEmail"] + '</small>');
            }
        }
        else {
            $field.closest('.field-wrapper').addClass('success').removeClass('error');
            this.parentView.$el.trigger('fieldSubmit', [$field, options]);
        }
        if (data.did_you_mean) {
            $field.parent().append('<small class="' + isError + ' message did-you-mean" data-content="' + data.did_you_mean + '">¿Has querido decir <a href="#">' + data.did_you_mean + '</a>?</small>');
        }

        this.metric.increment(['growth', 'posting', ['validation', 'mailgun', data.is_valid ? 'success' : 'error']]);

        $field.removeClass('validating');
    },
    validationError: function () {
        var $field = $('[name="email"]');
        var category = this.parentView.getItem().get('category');
        var options = {
            pendingValidation: (category.id === undefined || category.parentId === undefined),
            skipValidation: true
        };

        $field.removeClass('validating');
        this.parentView.$el.trigger('fieldSubmit', [$field, options]);
        this.metric.increment(['growth', 'posting', ['mailgun', 'apierror']]);
    },
    fillEmail: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = this.emailValid.get('element');
        var category = this.parentView.getItem().get('category');
        var options = {
            pendingValidation: (category.id === undefined || category.parentId === undefined)
        };
        
        if ($('small.message.exclude')) {
            $field.parent().find('small.message.exclude').remove();
        }

        this.metric.increment(['growth', 'posting', ['mailgun', 'didyoumean']]);

        $field.val($(event.currentTarget).data('content'));
        this.onBlurEmail();
    }
});

module.exports.id = 'post/contact';
