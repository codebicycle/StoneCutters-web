'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('pages/help');
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

        if (!valid) {
            $('.spinner').addClass('hide');
            $('#contactForm [type="submit"]').removeClass('hide');
        }
        else {
            $('.spinner').removeClass('hide');
            $('#contactForm [type="submit"]').addClass('hide');
        }
    }
});
