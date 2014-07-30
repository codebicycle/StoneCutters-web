'use strict';

var Base = require('../../../../../../common/app/bases/view').requireView('post/flow/index');
var _ = require('underscore');

module.exports = Base.extend({
    postRender: function() {
        this.app.router.once('action:end', this.onStart);
        this.app.router.once('action:start', this.onEnd);
    },
    onStart: function(event) {
        this.appView.trigger('postingflow:start');
    },
    onEnd: function(event) {
        this.appView.trigger('postingflow:end');
    },
    events: {
        'flow': 'onFlow'
    },
    onFlow: function(event, title, from, to, data) {
        if (!title) {
            title = this.$('#hub #steps').data('title');
        }
        if (!to) {
            to = 'hub';
        }
        this.$('header').trigger('change', [title, to, from]);
        this.$('#' + to).trigger('show', data);
        this.$('#' + from).trigger('hide', data);
    }
});
