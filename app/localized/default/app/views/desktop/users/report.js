'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('users/report');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');
var asynquence = require('asynquence');
var Conversation = require('../../../../../../models/conversation');

module.exports = Base.extend({
    className: 'users-report',
    events: {
        'click [data-action-report]': 'report'
    },
    report: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        asynquence().or(fail.bind(this))
            .then(fetch.bind(this))
            .val(success.bind(this));

        function fetch(done) {
            var conversation = this.getConversation();
            conversation.report(done);
        }

        function success() {
            this.$('#notification-message').removeClass('hide');
        }

        function fail() {

        }
    },
    getConversation: function() {
        this.conversation = this.conversation || (this.options.conversation && this.options.conversation.toJSON ? this.options.conversation : new Conversation(this.options.conversation || {}, {
            app: this.app
        }));
        return this.conversation;
    }

});
