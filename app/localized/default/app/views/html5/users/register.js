'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('users/register');
var _ = require('underscore');

module.exports = Base.extend({
    postRender: function() {
        this.app.router.once('action:end', this.onStart);
        this.app.router.once('action:start', this.onEnd);
    },
    onStart: function(event) {
        this.appView.trigger('register:start');
    },
    onEnd: function(event) {
        this.appView.trigger('register:end');
    }
});