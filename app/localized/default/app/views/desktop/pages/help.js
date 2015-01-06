'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('pages/help');
var config = require('../../../../../../../shared/config');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'main',
    id: 'pages-help-view',
    className: 'pages-help-view',
    events: {
        'click .help-toggle-content': 'helpToggleContent',
        'click .question .icons': 'helpToggleQuestion',
        'submit [data-contact-form]': 'submitForm'
    },

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var location = this.app.session.get('location');

        var mailDomain = config.get(['mails', 'domain', location.url], false) || location.url.replace('www.', '');

        var support = config.get(['mails', 'support', location.url], 'support') + '@' + mailDomain;
        var legal = config.get(['mails', 'legal', location.url], 'legal') + '@' + mailDomain;

        return _.extend({}, data, {
            mails: {
                support: support,
                legal: legal,

            }
        });
    },
    postRender: function(){
        var recaptcha = $('<script></script>');

        recaptcha.attr({
            type: 'text/javascript',
            src: 'https://www.google.com/recaptcha/api.js',
            async: true,
            defer: true
        });
        $('head').append(recaptcha);

    },
    helpToggleContent: function(event) {
        event.preventDefault();
        var element = $(event.currentTarget);
        element.parent('li').siblings('li.selected').removeClass('selected');
        element.parent('li').addClass('selected');
        $('.help-content-display').hide();
        $('#' + element.attr('data-help-content')).show();
    },
    helpToggleQuestion: function(event) {
        var element_current = $(event.currentTarget).parent('.question');

        $('h4.icon-arrow-down').toggleClass('icon-arrow-right icon-arrow-down');

        if(element_current.hasClass('faq-open')) {
            $(event.currentTarget).removeClass('icon-arrow-down');
            $('.faq-open').
                toggleClass('faq-open').
                find('.question-content').slideToggle();
        } else {
            element_current.find('.icon-arrow-right').toggleClass('icon-arrow-down icon-arrow-right');
            $('.faq-open').
                toggleClass('faq-open').
                find('.question-content').slideToggle();

            element_current.
                toggleClass('faq-open').
                find('.question-content').slideToggle();
        }
    },
    submitForm: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var data = Base.prototype.getTemplateData.call(this);
        var fields = [
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
        var value;

        $('[data-contact-form] .spinner').removeClass('hide');
        $('[data-contact-form] [type="submit"]').addClass('hide');

        $(fields).each( function() {
            value = $(this).val();
            if (value === '') {
                $(this).siblings('.error').text(message.empty).removeClass('hide');
                valid = false;
            } 
            else if ($(this).selector == '[name="email"]' && 
                    !emailRegExp.test(value)) {
                $(this).siblings('.error').text(message.invalidEmail).removeClass('hide');
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
                    $('[data-captcha-verification] .error').addClass('hide');
                    return this.sendForm();
                }
                $('[data-captcha-verification] .error').text(message.empty).removeClass('hide');
            }.bind(this))
            .fail(function(x) {
                console.log('error');
            });
        }
        else {
            this.$('[data-contact-form] .spinner').addClass('hide');
            this.$('[data-contact-form] [type="submit"]').removeClass('hide');
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
            subject: this.$('[name="subject"]').val(),
            email: this.$('[name="email"]').val(),
            name: this.$('[name="name"]').val(),
            message: this.$('[name="message"]').val()
        };

        return $.ajax({
            type: 'POST',
            url: url,
            data: data,
            success: function onSuccess(data) {
                this.$('[data-contact-form] .spinner').addClass('hide');
                this.$('[data-contact-form] [type="submit"]').removeClass('hide');
                if (!data.send) {
                    // TODO Handle error
                }
            }.bind(this)
        });
    }
});
