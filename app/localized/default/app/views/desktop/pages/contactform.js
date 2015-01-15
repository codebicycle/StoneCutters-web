'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('modals/modal', null, 'desktop');
var _ = require('underscore');

module.exports = Base.extend({
    id: 'contact-form',
    fields: [],
    events: {
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
    submitForm: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var data = Base.prototype.getTemplateData.call(this);
        this.fields = [
            this.$('[name="subject"]'),
            this.$('[name="name"]'),
            this.$('[name="email"]'),
            this.$('[name="message"]')
        ];
        var message = {
            'empty': data.dictionary["postingerror.PleaseCompleteThisField"],
            'invalidEmail': data.dictionary["postingerror.InvalidEmail"],
            'wrongCode': data.dictionary["supportform.VerificationCodeError"],
            'thankYou': data.dictionary["supportform.ThankYou"]
        };
        var emailRegExp = /^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,6})$/;
        var valid = true;
        var spinner = this.$('[data-contact-form] .spinner');
        var submit = this.$('[data-contact-form] [data-submit]');
        var value;
        var fieldset;

        spinner.removeClass('hide');
        submit.addClass('hide');
        this.$('fieldset.error').removeClass('error');

        $(this.fields).each( function() {
            value = $(this).val();
            fieldset = $(this).parent();

            if (value === '') {
                $(this).siblings('.error').text(message.empty).removeClass('hide');
                fieldset.addClass('error');
                valid = false;
            } 
            else if ($(this).selector == '[name="email"]' && 
                    !emailRegExp.test(value)) {
                $(this).siblings('.error').text(message.invalidEmail).removeClass('hide');
                fieldset.addClass('error');
                valid = false;
            }
            else {
                $(this).siblings('.error').addClass('hide');
            }
        });

        if (valid) {
            this.captchaCallback(this.$('#g-recaptcha-response').val())
            .done(function(result) {
                if (result.success) {
                    $('[data-captcha-verification]').removeClass('error');
                    $('[data-captcha-verification] .error').addClass('hide');
                    return this.sendForm();
                }
                $('[data-captcha-verification] .error').text(message.empty).removeClass('hide');
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

        return $.ajax({
            type: 'POST',
            url: url,
            data: data,
            success: function onSuccess(data) {
                if (data.send) {
                    this.submitSuccess();

                    $(this.fields).each(function() {
                        this.val('');
                    });
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