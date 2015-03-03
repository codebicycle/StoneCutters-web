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
    regexpFindPage: /-p-[0-9]+/,
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
            .val(change.bind(this));

        function validate(done) {
            this.$('[data-error]').addClass('hide');
            this.$('[data-messageText]').removeClass('error');
            if (!this.$('[data-messageText]').val()) {
                this.$('[data-error]').removeClass('hide');
                this.$('[data-messageText]').addClass('error');
                return done.abort();
            }
            done();
        }

        function submit(done) {
            this.$('.spinner, .reply-send').toggle();
            this.conversation.reply(done);
        }

        function change() {
            if (this.app.session.get('path').match(this.regexpFindPage)) {
                this.app.router.redirectTo('/myolx/conversation/' + this.conversation.get('threadId'));
            }
            else {
                this.app.router.redirectTo('/myolx/conversation/' + this.conversation.get('threadId') + '-p-1');
            }
        }

        function fail(err) {
            this.$('.spinner, .reply-send').toggle();
            this.$('[data-messageText]').addClass('error');
        }
    },
    validate: function() {
        return true;
    }
});

module.exports.id = 'users/conversation';
