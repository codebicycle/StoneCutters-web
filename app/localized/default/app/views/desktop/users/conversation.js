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

        data.thread = this.parentView.getConversation();
        return data;
    },
    postRender: function() {
        var conversation = this.$('ul.conversation');

        this.scrollBottom(conversation);
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
            .then(success.bind(this))
            .val(change.bind(this));

        function validate(done) {
            if (!this.validate(this.$('[data-messageText]'))) {
                return done.abort();
            }
            done();
        }

        function submit(done) {
            this.$('.spinner').removeClass('hide');
            this.parentView.getConversation().reply(done);
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
                conversation: {
                    model: 'Conversation',
                    params: params
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }

        function change(res) {
            console.log(res.conversation);
            this.parentView.conversation = res.conversation;
            this.parentView.getConversation().set('user', this.app.session.get('user'));
            this.parentView.getConversation().set('platform', this.app.session.get('platform'));
            this.parentView.getConversation().set('location', this.app.session.get('location').url);
            this.render();
        }

        function fail(err) {
            this.$('.spinner').addClass('hide');
            this.$('[data-messageText]').addClass('error');
        }
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
    scrollBottom: function(conversation) {
        var height = conversation[0].scrollHeight;

        conversation.scrollTop(height);
    }
});

module.exports.id = 'users/conversation';
