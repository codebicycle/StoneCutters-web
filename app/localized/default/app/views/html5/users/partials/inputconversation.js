'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../../common/app/bases/view').requireView('users/partials/inputconversation');
var helpers = require('../../../../../../../helpers');
var statsd = require('../../../../../../../../shared/statsd')();


module.exports = Base.extend({
    events: {
        'click .reply-send': 'onSubmit',
        'reset': 'onReset'
    },
    postRender: function() {
        this.$('.conversation-input input').focus();
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $form = $('.conversation-input');
        var message = $form.find('[data-messageText]').val();
        var user = this.app.session.get('user');

        if ($form.find('input').val()) {
            $form.find('.spinner, .reply-send').toggle();

            var prepare = function(done) {
                // TODO: mostrar mensajes aunque no este logueado el usuario
                if (!user) {
                    done.abort();
                    return helpers.common.redirect.call(this.app.router, '/login', null, {
                        status: 302
                    });
                }
                done();
            }.bind(this);

            var sendMessage = function(done) {
                helpers.dataAdapter.post(this.app.req, '/conversations/' + this.parentView.threadId + '/reply', {
                    query: {
                        token: user.token,
                        userId: user.userId,
                        platform: this.app.session.get('platform')
                    },
                    data: {
                        message: message
                    },
                    cache: false,
                    json: true
                }, done.errfcb);
            }.bind(this);

            var change = function(res) {
                statsd.increment([this.app.session.get('location').abbreviation, 'conversations', 'reply', 'success', this.app.session.get('platform')]);
                this.parentView.$el.trigger('newMessage');
                this.$el.trigger('reset');
            }.bind(this);

            var error = function(err) {
                statsd.increment([this.app.session.get('location').abbreviation, 'conversations', 'reply', 'error', this.app.session.get('platform')]);
                $form.find('.spinner, .reply-send').toggle();
                $('[data-messageText]').addClass('error');
            }.bind(this);

            asynquence().or(error)
                .then(prepare)
                .then(sendMessage)
                .val(change);
        }
    },
    onReset: function() {
        this.render();
    }
});

module.exports.id = 'users/partials/inputconversation';
