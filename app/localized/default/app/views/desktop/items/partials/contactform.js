'use strict';

var Base = require('../../../../../../common/app/bases/view');
var helpers = require('../../../../../../../helpers');
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
        var comment = $('#comment').val();
        var phone = $('#phone').val();
        var itemId = $('.itemId').val();
        var url = [];

        url.push('/items/');
        url.push(itemId);
        url.push('/reply');
        url = helpers.common.fullizeUrl(url.join(''), this.app);

        var validate = function(done) {
            if (this.validateForm(email, name, comment)) {
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
                    message: comment,
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

            $('.comment').val('');
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
    validateForm: function(email, name, comment) {
        if((this.isEmpty(email, 'email') || this.isEmpty(name, 'name') || this.isEmpty(comment, 'comment')) && this.isEmail(email, 'email')) {
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
    isEmpty: function (value,field) {
        if(value === ''){
            $('span.' + field).text('Por favor complete este campo.').removeClass('hide');
            $('fieldset.' + field).addClass('error');
            $('fieldset.' + field + ' span.icons').addClass('icon-attention');
            return false;
        }else{
            $('span.' + field).addClass('hide');
            $('fieldset.' + field).removeClass('error');
            $('fieldset.' + field + ' span.icons').removeClass('icon-attention');
            return true;
        }
    },
    isEmail: function (value,field) {
        var expression = /^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,6})$/;
        if(!expression.test(value)){
            $('span.' + field).text('La dirección de correo electrónico es inválida.').removeClass('hide');
            $('fieldset.' + field).addClass('error');
            $('fieldset.' + field + ' span.icons').addClass('icon-attention');
            return false;
        }else{
            $('span.' + field).addClass('hide');
            $('fieldset.' + field).removeClass('error');
            $('fieldset.' + field + ' span.icons').removeClass('icon-attention');
            return true;
        }
    }
});

module.exports.id = 'items/partials/contactform';
