'use strict';

var Base = require('../../../../../../common/app/bases/view');
var helpers = require('../../../../../../../helpers');
var translations = require('../../../../../../../../shared/translations');
var statsd = require('../../../../../../../../shared/statsd')();
var asynquence = require('asynquence');

module.exports = Base.extend({
    className: 'item-contact-form',
    id: 'item-contact-form',
    tagName: 'section',
    events: {
        'blur input': 'validateField',
        'blur textarea': 'validateField',
        'submit': 'submitForm',
        'click .replySuccess span': 'showSubmit'
    },
    initialize: function() {
        Base.prototype.initialize.call(this);
        this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
    },
    showSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        $('.replySuccess').addClass('hide');
        $('#replyForm .submit').removeClass('hide');
    },
    submitForm: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var email = $('#email').val();
        var name = $('#name').val();
        var message = $('#message').val();
        var phone = $('#phone').val();
        var itemId = $('.itemId').val();
        var url = [];

        url.push('/items/');
        url.push(itemId);
        url.push('/reply');
        url = helpers.common.fullizeUrl(url.join(''), this.app);

        var validate = function(done) {
            if (this.validateForm(email, name, message)) {
                $('.spinner').removeClass('hide');
                $('#replyForm .submit').addClass('hide');
                done();
            }
            else {
                done.abort();
                always();
                trackFail();
            }
        }.bind(this);

        var post = function(done) {
            $.ajax({
                type: 'POST',
                url: helpers.common.link(url, this.app),
                cache: false,
                data: {
                    message: message,
                    email: email,
                    name:name,
                    phone:phone
                }
            })
            .done(done)
            .fail(done.fail)
            .always(always);
        }.bind(this);

        var success = function(done, data) {
            var $replySuccess = $('.replySuccess');

            $('.message').val('');
            $('.name').val('');
            $('.email').val('');
            $('.phone').val('');
            $replySuccess.removeClass('hide');
            done(data);
        }.bind(this);

        var trackEvent = function(done, data) {
            var category = $('.itemCategory').val();
            var subcategory = $('.itemSubcategory').val();

            this.track({
                category: 'Reply',
                action: 'ReplySuccess',
                custom: ['Reply', category, subcategory, 'ReplySuccess', itemId].join('::')
            });
            done();
        }.bind(this);

        var trackTracking = function(done, data) {
            var $view = $('#partials-tracking-view');
            var tracking;

            tracking = $('<div></div>').append(data);
            tracking = $('#partials-tracking-view', tracking);
            if (tracking.length) {
                $view.trigger('updateHtml', tracking.html());
            }
            done();
        }.bind(this);

        var trackGraphite = function(done) {
            var location = this.app.session.get('location');
            var platform = this.app.session.get('platform');

            statsd.increment([location.name, 'reply', 'success', platform]);
            done();
        }.bind(this);

        var always = function() {
            $('.spinner').addClass('hide');
        }.bind(this);

        var fail = function(data) {
            trackFail();
        }.bind(this);

        var trackFail = function() {
            var location = this.app.session.get('location');
            var platform = this.app.session.get('platform');

            statsd.increment([location.name, 'reply', 'error', platform]);
        }.bind(this);

        asynquence().or(fail)
                .then(validate)
                .then(post)
                .gate(success, trackEvent, trackTracking, trackGraphite);
    },
    validateForm: function(email, name, message) {
        if((this.isEmpty(email, 'email') || this.isEmpty(name, 'name') || this.isEmpty(message, 'message')) && this.isEmail(email, 'email')) {
            return true;
        }
        return false;
    },
    validateField: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var field = $(event.currentTarget).attr('name');
        var value = $(event.currentTarget).val();
        var result = this.isEmpty(value, field);

        if(field === 'email' && result) {
            this.isEmail(value, field);
        }
    },
    isEmpty: function (value, field) {
        var hasError = (value === '');

        return this.setError({
            field: field,
            hasError: hasError,
            text: this.dictionary['postingerror.PleaseCompleteThisField']
        });
    },
    isEmail: function (value, field) {
        var expression = /^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,6})$/;
        var hasError = !expression.test(value);

        return this.setError({
            field: field,
            hasError: hasError,
            text: this.dictionary['postingerror.InvalidEmailAddress']
        });
    },
    setError: function (params) {
        var hasError = params.hasError;

        $('span.' + params.field).text(params.text).toggleClass('hide', !hasError);
        $('fieldset.' + params.field).toggleClass('error', hasError);
        $('fieldset.' + params.field + ' span.icons').toggleClass('icon-attention', hasError);
        return !hasError;
    },
});

module.exports.id = 'items/partials/contactform';
