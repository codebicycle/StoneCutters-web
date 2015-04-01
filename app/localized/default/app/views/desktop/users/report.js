'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('users/report');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');
var asynquence = require('asynquence');
var Conversation = require('../../../../../../models/conversation');
var Metric = require('../../../../../../modules/metric');

module.exports = Base.extend({
    tagName: 'main',
    id: 'users-report',
    className: 'users-report',
    events: {
        'click [data-increment]': Metric.incrementEventHandler,
        'click [data-action-report]': 'report'
    },
    report: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $progressBar = $('#progressBar');
        $progressBar.show();
        $progressBar.width('80%');

        asynquence().or(fail.bind(this))
            .then(fetch.bind(this))
            .val(success.bind(this));

        function fetch(done) {
            var conversation = this.getConversation();
            conversation.report(done);
        }

        function success() {
            $progressBar.hide();
            $progressBar.width('0');
            this.$('.page-standart').addClass('hide');
            this.$('#report-success').removeClass('hide');
        }

        function fail() {
            $progressBar.hide();
            $progressBar.width('0');
            this.$('.page-standart').addClass('hide');
            this.$('#report-error').removeClass('hide');
        }
    },
    getConversation: function() {
        this.conversation = this.conversation || (this.options.conversation && this.options.conversation.toJSON ? this.options.conversation : new Conversation(this.options.conversation || {}, {
            app: this.app
        }));
        return this.conversation;
    }
});
