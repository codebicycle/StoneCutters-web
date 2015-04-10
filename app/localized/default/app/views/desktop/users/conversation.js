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
        'keydown textarea': 'ctrlEnter'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        data.thread = this.parentView.getConversation();
        return data;
    },
    postRender: function() {
        this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
        var $conversation = this.$('ul.conversation');

        this.scrollBottom($conversation);
    },
    onChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var field = $(event.target);

        if (this.validate(field)) {
            this.parentView.getConversation().set(field.attr('name'), field.val());
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

        function submit(done) {
            this.$('.spinner').removeClass('display-none');
            this.$('.btn.orange').addClass('display-none');
            this.parentView.getConversation().reply(done);
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
            newMessage = '<li class="conversation-chat"><span class="name">' + this.dictionary["myolx.You"] + '</span><span class="date"> - <time> ' + date + ' </time></span><p class="message">' + this.parentView.getConversation().get('message') + '</p></li>';
            $conversation.append(newMessage);
            this.scrollBottom($conversation);
            this.$('.spinner').addClass('display-none');
            this.$('.btn.orange').removeClass('display-none');
            this.$('[data-messageText]').val('');
        }

        function fail(err) {
            this.$('.spinner').addClass('display-none');
            this.$('.btn.orange').removeClass('display-none');
            this.$('[data-messageText]').addClass('error');
        }
    },
    validate: function(field) {
        if (!field.val()) {
            this.$('[data-error]').removeClass('display-none');
            this.$('[data-messageText]').addClass('error');
            return false;
        }
        else {
            this.$('[data-error]').addClass('display-none');
            this.$('[data-messageText]').removeClass('error');
            return true;
        }
    },
    scrollBottom: function(conversation) {
        var height = conversation[0].scrollHeight;

        conversation.scrollTop(height);
    },
    ctrlEnter: function (event) {
        if ((event.metaKey || event.ctrlKey) && event.keyCode == 13) {
            var field = $(event.target);

            if (this.validate(field)) {
                this.parentView.getConversation().set(field.attr('name'), field.val());
            }
            this.$('form').trigger('submit');
        }
    }
});

module.exports.id = 'users/conversation';
