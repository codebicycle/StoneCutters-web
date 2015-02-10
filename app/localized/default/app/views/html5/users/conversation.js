'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('users/conversation');
var Thread = require('../../../../../../models/conversation');
var asynquence = require('asynquence');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');
var async = require('async');

module.exports = Base.extend({
    className: 'users_conversation_view',
    events: {
        'newMessage': 'getConversation'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        data.thread = this.getThread().toJSON();
        return data;
    },
    postRender: function() {
        this.checkPosition();
        this.detectScroll = this.detectScroll.bind(this);
        this.threadId = $('.conversation-input').attr('data-threadId');

        $(document).on('scroll', this.detectScroll);

        this.poll = setInterval(this.getConversation.bind(this), 20000);

        this.app.router.once('action:end', this.onStart);
        this.app.router.once('action:start', this.onEnd.bind(this));
    },
    off: function() {
        $(document).off('scroll', this.detectScroll);
        clearInterval(this.poll);
    },
    onChange: function() {
        this.$el.trigger('conversationReset');
    },
    detectScroll: function(e) {
        var topHeight = $('.header_index_view').outerHeight() + this.$('header').outerHeight();
        var height = $(window).scrollTop();

        if (height > topHeight + 30) {
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
        var documentHeight = $(document).height();
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
        setTimeout(function goTo() {
            $('html, body').animate({
                scrollTop: viewHeight
            }, 200);
        }, 100);
    },
    onStart: function(event) {
        this.appView.trigger('conversation:start');
    },
    onEnd: function(event) {
        this.off();
        this.app.router.appView.trigger('conversation:end');
    },
    getThread: function() {
        this.thread = this.thread || (this.options.thread && this.options.thread.toJSON ? this.options.thread : new Thread(this.options.thread || {}, {
            app: this.app
        }));
        return this.thread;
    },
    getConversation: function() {
        var user = this.app.session.get('user');

        var fetch = function(done) {
            this.app.fetch({
                thread: {
                    model: 'Thread',
                    params: {
                        token: user.token,
                        userId: user.userId,
                        threadId: this.threadId,
                        pageSize: 300
                    }
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var change = function(res) {
            this.getThread().set(res.thread.toJSON());
        }.bind(this);

        var error = function(err) {
            console.log(err);
        }.bind(this);

        asynquence().or(error)
            .then(fetch)
            .val(change);
    }
});

module.exports.id = 'users/conversation';
