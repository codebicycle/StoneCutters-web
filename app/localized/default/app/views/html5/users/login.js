'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('users/login');
var _ = require('underscore');

module.exports = Base.extend({
    postRender: function() {
        this.app.router.once('action:end', this.onStart);
        this.app.router.once('action:start', this.onEnd);
        this.showMessage();
    },
    onStart: function(event) {
        this.appView.trigger('login:start');
    },
    onEnd: function(event) {
        this.appView.trigger('login:end');
    },
    showMessage: function() {
        var $msg = this.$('.msg-resulted');

        if (this.options.sent && this.options.sent === true) {
            $msg.addClass('visible');
            setTimeout(function(){
                $msg.removeClass('visible');
            }, 3000);
        }
    }
});