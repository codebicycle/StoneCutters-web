'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('modals/modal', null, 'desktop');
var _ = require('underscore');
var Metric = require('../../../../../../modules/metric');

module.exports = Base.extend({
    id: 'contact-form',
    events: {
        'blur input:not([type="submit"])' : 'validateField',
        'blur textarea' : 'validateField',
        'submit [data-contact-form]': 'submitForm',
        'click [data-reply="error"] span': 'submitAgain'
    },

    postRender: function(){
        var recaptcha = $('<script></script>');

        recaptcha.attr({
            type: 'text/javascript',
            src: 'https://www.google.com/recaptcha/api.js',
            async: true,
            defer: true
        });
        this.$el.append(recaptcha);

    },
    getMessages: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var messages = {
            'empty': data.dictionary["postingerror.PleaseCompleteThisField"],
            'invalidEmail': data.dictionary["postingerror.InvalidEmail"],
            'wrongCode': data.dictionary["supportform.VerificationCodeError"],
            'thankYou': data.dictionary["supportform.ThankYou"]
        };

        return messages;
    },
    getFields: function(){
        var fields = [
            this.$('[name="subject"]'),
            this.$('[name="name"]'),
            this.$('[name="email"]'),
            this.$('[name="message"]')
        ];
        return fields;
    },
    validateField: function(event){
        var messages = this.getMessages();
        var emailRegExp = /^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,6})$/;
        var field = event.target;
        var value = event.target.value;
        var fieldset = event.target.parentNode;

        if (value === '') {
            $(fieldset).find('.error').text(messages.empty).removeClass('hide');
            $(fieldset).addClass('error');
        } 
        else if (field.name == 'email' && 
                !emailRegExp.test(value)) {
            $(fieldset).find('.error').text(messages.invalidEmail).removeClass('hide');
            $(fieldset).addClass('error');
        }
        else {
            $(fieldset).find('.error').addClass('hide');
            $(fieldset).removeClass('error');
        }
    },
    validateForm: function(){
        var fields = this.getFields();
        var messages = this.getMessages();
        var valid = true;

        $(fields).each( function() {
            if ($(this).val() === '') {
                $(this).siblings('.error').text(messages.empty).removeClass('hide');
                $(this).parent().addClass('error');
                valid = false;
            }
        });

        return valid;
    },
    submitForm: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var messages = this.getMessages();
        var spinner = this.$('[data-contact-form] .spinner');
        var submit = this.$('[data-contact-form] [data-submit]');

        spinner.removeClass('hide');
        submit.addClass('hide');

        if (this.validateForm()) {
            this.captchaCallback(this.$('#g-recaptcha-response').val())
            .done(function(result) {
                if (result.success) {
                    $('[data-captcha-verification]').removeClass('error');
                    $('[data-captcha-verification] .error').addClass('hide');
                    return this.sendForm();
                }
                $('[data-captcha-verification] .error').text(messages.empty).removeClass('hide');
                $('[data-captcha-verification]').addClass('error');
                spinner.addClass('hide');
                submit.removeClass('hide');
            }.bind(this))
            .fail(function(x) {
                console.log('error');
            });
        }
        else {
            spinner.addClass('hide');
            submit.removeClass('hide');
        }
    },
    captchaCallback: function(captchaResponse){
        var url = "/secure/recaptcha";
        var userIp = this.app.session.get('ip');
        var data = {
            response: captchaResponse,
            remoteip: userIp
        };

        return $.ajax({
            type: 'GET',
            url: url,
            data: data,
            dataType: 'json'
        });
    },
    sendForm: function(){
        var url = "/secure/send";
        var data = {
            area: this.$('[name="area"]').val(),
            subject: this.$('[name="subject"]').val(),
            email: this.$('[name="email"]').val(),
            name: this.$('[name="name"]').val(),
            message: this.$('[name="message"]').val(),
            location: this.app.session.get('location').url
        };
        var fields = this.getFields();

        return $.ajax({
            type: 'POST',
            url: url,
            data: data,
            success: function onSuccess(data) {
                if (data.send) {
                    this.submitSuccess();

                    $(fields).each(function() {
                        this.val('');
                    });
                    if (!this.metric) {
                        this.metric = new Metric({}, this);
                    }
                    this.metric.increment(['zendesk', 'help', ['contact']]);
                }
                else {
                    this.$('[data-contact-form] .spinner').addClass('hide');
                    this.$('[data-contact-form] [data-reply="error"]').removeClass('hide');
                }
            }.bind(this)
        });
    },
    submitSuccess: function(){
        this.$('.contact > p').remove();
        this.$('[data-contact-form] >:not([data-reply="success"])').remove();
        this.$('[data-contact-form] [data-reply="success"]').removeClass('hide');
        this.$('[data-contact-form] [data-reply="success"] span').hide();
    },
    submitAgain: function(){
        this.$('[data-contact-form] [data-submit]').removeClass('hide');
        this.$('[data-contact-form] [data-reply="error"]').addClass('hide');
    }
});

module.exports.id = 'pages/contactform';