'use strict';

var _ = require('underscore');
var async = require('async');
var asynquence = require('asynquence');
var Base = require('../../../../../common/app/bases/view').requireView('users/conversation');
var Conversation = require('../../../../../../models/conversation');
var translations = require('../../../../../../../shared/translations');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    className: 'users_conversation_view',
    events: {
        'change textarea, input:not([type=submit], [type=hidden])': 'onChange',
        'submit': 'onSubmit',
        'click [data-action=sold]': 'soldItem'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        data.thread = this.getConversation();
        return data;
    },
    postRender: function() {
        this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
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
            .val(success.bind(this));

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
            params.conversation_type = this.getConversation().get('conversation_type');

            if (this.getConversation().get('conversation_type') === 'login') {
                params.token = this.getConversation().get('user').token;
                params.userId = this.getConversation().get('user').userId;
                params.threadId = this.getConversation().get('threadId');
            }
            else {
                params.hash = this.getConversation().get('hash');
            }
            done();
        }

        function success(done) {
            var $conversation = this.$('ul.conversation');
            var date = new Date();
            var newMessage;

            date = {
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                day: date.getDate(),
                hour: date.getHours(),
                minute: date.getMinutes(),
                second: date.getSeconds()
            };
            date = helpers.timeAgo(date);
            date = this.dictionary[date.dictionary] + ' ' + date.hour;
            newMessage = '<li class="message is-mine"><span class="name">' + this.dictionary["myolx.You"] + '</span><p class="text">' + this.getConversation().get('message') + '</p><span class="date"><time> ' + date + ' </time></span></li>';
            $conversation.append(newMessage);
            this.checkPosition();
            this.$('.spinner').addClass('hide');
            this.$('.reply-send').removeClass('hide');
            this.$('[data-messageText]').val('');
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
    },
    soldItem: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $target = $(event.target);
        var itemId = $target.data('id');
        

        asynquence().or(fail.bind(this))
            .then(remove.bind(this))
            .then(submit.bind(this))
            //.then(prepare.bind(this))
            .val(success.bind(this));

        function remove(done) {
            this.getConversation().set('message', 'Se vendio amigo');
            helpers.dataAdapter.post(this.app.req, '/items/' + itemId + '/delete', {
                query: {
                    token: (this.app.session.get('user') || {}).token,
                    reason: 2
                },
                cache: false
            }, done.errfcb);
        }

        function submit(done) {
            this.getConversation().reply(done);
        }

        function success(done) {
            //this.getConversation().reply(done);
        }

        function fail() {

        }
    }
});

module.exports.id = 'users/conversation';
