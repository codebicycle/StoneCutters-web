'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('users/conversation');
var Thread = require('../../../../../../models/conversation');
var asynquence = require('asynquence');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');
var async = require('async');

module.exports = Base.extend({
    className: 'users_conversation_view',
    postRender: function() {
        this.checkPosition();
        $(document).on('scroll', this.detectScroll.bind(this));
        this.app.router.once('action:end', this.onStart);
        this.app.router.once('action:start', this.onEnd);
    },
    detectScroll: function(e) {
        var topHeight = $('.header_index_view').outerHeight() + this.$('header').outerHeight();
        var height = $(window).scrollTop();

        if (height > topHeight) {
            this.$('.item').css({
                position: 'fixed',
                top: 0
            });
        }
        else {
            this.$('.item').css('position', 'relative');
        }
    },
    checkPosition: function() {
        var documentHeight = $('.header_index_view').outerHeight() + this.$('header').outerHeight() + this.$('.conversation').outerHeight();
        var windowHeight = $(window).height();

        if (documentHeight > windowHeight) {
            this.$('.conversation').css('padding-bottom', '54px');
            this.$('.conversation-input').css({
                position: 'fixed',
                bottom: 0
            });
            this.goToBottom();
        }
    },
    goToBottom: function() {
        var viewHeight = this.$el.outerHeight();
        setTimeout(function goTo(){
            $('html, body').animate({
                scrollTop: viewHeight
            }, 200);
        }, 100);
    },
    onStart: function(event) {
        this.appView.trigger('conversation:start');
    },
    onEnd: function(event) {
        $(document).off('scroll', this.detectScroll);
        this.appView.trigger('conversation:end');
    }
});

module.exports.id = 'users/conversation';
