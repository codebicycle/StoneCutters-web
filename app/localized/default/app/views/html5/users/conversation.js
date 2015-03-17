'use strict';

var _ = require('underscore');
var async = require('async');
var asynquence = require('asynquence');
var Base = require('../../../../../common/app/bases/view').requireView('users/conversation');
var Conversation = require('../../../../../../models/conversation');
var helpers = require('../../../../../../helpers');
var statsd = require('../../../../../../../shared/statsd')();

module.exports = Base.extend({
    className: 'users_conversation_view',
    events: {
        'change textarea, input:not([type=submit], [type=hidden])': 'onChange',
        'submit': 'onSubmit'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        data.thread = this.getConversation();
        return data;
    },
    postRender: function() {
        this.checkPosition();
        this.app.router.once('action:end', this.onStart);
        this.app.router.once('action:start', this.onEnd.bind(this));
    },
    onChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var field = $(event.target);

        if (this.validate(field)) {
            this.getConversation().set(field.attr('name'), field.val());
        }
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var params = {};

        asynquence().or(fail.bind(this))
            .then(validate.bind(this))
            .then(submit.bind(this))
            .then(prepare.bind(this))
            .then(success.bind(this))
            .val(change.bind(this));

        function validate(done) {

            if (!this.validate(this.$('[data-messageText]'))) {
                return done.abort();
            }
            done();
        }

        function submit(done) {
            this.$('.reply-send').addClass('hide');
            this.$('.spinner').removeClass('hide');
            this.getConversation().reply(done);
        }

        function prepare(done) {
            params.pageSize = 300;
            params.conversation_type = this.parentView.getConversation().get('conversation_type');

            if (this.parentView.getConversation().get('conversation_type') === 'login') {
                params.token = this.parentView.getConversation().get('user').token;
                params.userId = this.parentView.getConversation().get('user').userId;
                params.threadId = this.parentView.getConversation().get('threadId');
            }
            else {
                params.hash = this.parentView.getConversation().get('hash');
            }
            done();
        }

        function success(done) {
            this.app.fetch({
                    thread: {
                    model: 'Conversation',
                    params: params
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }

        function change(res) {
            this.conversation = res.conversation;
            this.getConversation().set('user', this.app.session.get('user'));
            this.getConversation().set('platform', this.app.session.get('platform'));
            this.getConversation().set('location', this.app.session.get('location').url);
            this.render();
        }

        function fail(err) {
            this.$('.spinner').addClass('hide');
            this.$('.reply-send').removeClass('hide');
            this.$('[data-messageText]').addClass('error');
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
    getConversation: function() {
        this.conversation = this.conversation || (this.options.thread && this.options.thread.toJSON ? this.options.thread : new Conversation(this.options.thread || {}, {
            app: this.app
        }));
        return this.conversation;
    },
    validate: function(field) {
        if (!field.val()) {
            this.$('[data-error]').removeClass('hide');
            this.$('[data-messageText]').addClass('error');
            return false;
        }
        else {
            this.$('[data-error]').addClass('hide');
            this.$('[data-messageText]').removeClass('error');
            return true;
        }
    },
    onStart: function(event) {
        this.appView.trigger('conversation:start');
    },
    onEnd: function(event) {
        this.app.router.appView.trigger('conversation:end');
    }
});

module.exports.id = 'users/conversation';
