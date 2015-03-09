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
        'blur textarea, input:not([type=submit], [type=hidden])': 'onBlur',
        'submit': 'onSubmit'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        data.thread = this.parentView.getThread();
        return data;
    },
    postRender: function() {
        var wtf = $('ul.conversation');
        var height = wtf[0].scrollHeight;
        wtf.scrollTop(height);
        console.log(height);
        if (!this.rendered) {
            this.conversation = new Conversation({
                country: this.app.session.get('location').abbreviation,
                platform: this.app.session.get('platform'),
                user: this.app.session.get('user'),
                threadId: this.parentView.getThread().get('threadId')
            }, {
                app: this.app
            });
        }
        this.rendered = true;
    },
    onBlur: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var field = $(event.target);

        if (this.validate(field)) {
            this.conversation.set(field.attr('name'), field.val());
        }
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        asynquence().or(fail.bind(this))
            .then(validate.bind(this))
            .then(submit.bind(this))
            .then(success.bind(this))
            .val(change.bind(this));

        function validate(done) {

            if (!this.validate(this.$('[data-messageText]'))) {
                return done.abort();
            }
            done();
        }

        function submit(done) {
            this.$('.spinner, .reply-send').toggle();
            this.conversation.reply(done);
        }

        function success(done) {
            this.app.fetch({
                    thread: {
                    model: 'Conversation',
                    params: {
                        token: this.conversation.get('user').token,
                        userId: this.conversation.get('user').userId,
                        threadId: this.conversation.get('threadId'),
                        pageSize: 300
                    }
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }

        function change(res) {
            this.parentView.thread = res.thread;
            this.render();
        }

        function fail(err) {
            this.$('.spinner, .reply-send').toggle();
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
    }
});

module.exports.id = 'users/conversation';
