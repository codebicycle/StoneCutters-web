'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view');
var Mailgun = require('../../../../../../modules/validator/models/mailgun');
var Metric = require('../../../../../../modules/metric');
var config = require('../../../../../../../shared/config');
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
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var locationUrl = this.app.session.get('location').url;
        var isPhoneMandatory = config.getForMarket(locationUrl, ['validator', 'phone', 'enabled'], false);

        return _.extend({}, data, {
            isPhoneMandatory: isPhoneMandatory
        });
    },
    postRender: function() {
        var $field = this.$('[name="email"]');

        if (!this.metric) {
            this.metric = new Metric({}, {
                app: this.app
            });
        }
        this.parentView.validator.register($field, {
            rules: [{
                id: 'mailgun',
                message: this.dictionary['misc.DescriptionCharacters_Mob'].replace('<<NUMBER>>', ' ' + 10 + ' '),
                fn: function validate(val) {
                    return val.length < 10;
                }
            }]
        }, true);
    },
    onValidate: function(event, done, isValid) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.validate(this.$('[name="email"]'), function onComplete(isValidEmail) {
            done(isValid && isValidEmail && isValidatePhone.call(this));
        }.bind(this));

        function isValidatePhone() {
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

        if ($field.attr('name') !== 'email' || !Mailgun.isEnabled(this.app)) {
            this.parentView.$el.trigger('fieldSubmit', [$field, options]);
        }
    },
    onDisablePost: function(event) {
        this.$('.posting').attr('disabled', 'disabled');
    },
    onEnablePost: function(event) {
        this.$('.posting').removeAttr('disabled');
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
        var $field = this.$('[name="email"]');
        var value = $field.val();
        var category;
        
        if ($field.data('value') !== value) {   
            if (Mailgun.isEnabled(this.app)) {
                if (!value) {
                    category = this.parentView.getItem().get('category');
                    return this.parentView.$el.trigger('fieldSubmit', [$field, {
                        pendingValidation: (category.id === undefined || category.parentId === undefined),
                    }]);
                }
                this.validate($.noop, $field);
                $field.data('value', value);
            }
        }
    },
    validate: function(field, callback) {
        var $field = $(field);
        var valid = this.parentView.validator.validate($field, {
            mailgun: {
                progress: this.inProgressValidation.bind(this),
                always: this.alwaysValidation.bind(this),
                success: success.bind(this),
                error: error.bind(this)
            }
        });
        var details = this.parentView.validator.details($field);
        
        this.parentView.$el.trigger('hideError', [$field]);
        if (!valid && details && details.length) {
            this.parentView.$el.trigger('showError', [$field, {
                message: details.pop()
            });
        }
        (callback || $.noop)(valid);
        return valid;
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

        this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
        
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
    }
});

module.exports.id = 'post/contact';
