'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var config = require('../../../../../../../shared/config');
var EmailValidator = require('../../../../../../modules/emailValidator');
var translations = require('../../../../../../../shared/translations');
var statsd = require('../../../../../../../shared/statsd')();
var _ = require('underscore');

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
        'change [name="email"]': 'onBlurEmail',
        'click .did-you-mean': 'fillEmail'
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

        if (config.getForMarket(locationUrl, ['validator', 'email', 'enabled'], false)) {
            var currentPage = this.editing ? 'editing' : 'posting';
            var $field = this.$('[name="email"]');
            var value = $field.val();
            
            if (!value) {
                var category = this.parentView.getItem().get('category');
                var options = {
                    pendingValidation: (category.id === undefined || category.parentId === undefined),
                };

                return this.parentView.$el.trigger('fieldSubmit', [$field, options]);
            }

            if ($field.data('value') !== value) {
                if (this.emailValid) {
                    this.emailValid = null;
                }
                this.emailValid = new EmailValidator({
                    element: $field,
                    progress: this.inProgressValidation.bind(this),
                    success: this.successValidation.bind(this),
                    error: this.validationError.bind(this),
                    currentPage: currentPage
                }, {
                    app: this.app
                });

                $field.data('value', value);
            }
        }
    },
    inProgressValidation: function() {
        var $field = this.$('[name="email"]').addClass('validating');

        delete this.parentView.errors[$field.attr('name')];
        $field.siblings('.error.message').remove();
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

        statsd.increment([this.app.session.get('location').abbreviation, this.emailValid.get('currentPage'), data.is_valid ? 'success' : 'error', 'email', 'success', this.app.session.get('platform')]);

        $field.removeClass('validating');
    },
    validationError: function () {
        var $field = $('[name="email"]');
        var category = this.parentView.getItem().get('category');
        var options = {
            pendingValidation: (category.id === undefined || category.parentId === undefined)
        };

        $field.removeClass('validating');
        this.parentView.$el.trigger('fieldSubmit', [$field, options]);
        statsd.increment([this.app.session.get('location').abbreviation, this.emailValid.get('currentPage'), 'error', 'email', 'error', this.app.session.get('platform')]);
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

        statsd.increment([this.app.session.get('location').abbreviation, this.emailValid.get('currentPage'), 'success', 'email', 'click', this.app.session.get('platform')]);

        $field.val($(event.currentTarget).data('content'));
        this.parentView.$el.trigger('fieldSubmit', [$field, options]);
    }
});

module.exports.id = 'post/contact';
