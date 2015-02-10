'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../../common/app/bases/view').requireView('users/partials/inputconversation');
var helpers = require('../../../../../../../helpers');

module.exports = Base.extend({
    events: {
        'click .reply-send': 'onSubmit',
        'reset': 'onReset'
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

            var success = function(done) {
                this.app.fetch({
                    thread: {
                        model: 'Thread',
                        params: {
                            token: user.token,
                            userId: user.userId,
                            threadId: this.parentView.threadId
                        }
                    }
                }, {
                    readFromCache: false
                }, done.errfcb);
            }.bind(this);

            var change = function(res) {
                this.parentView.$el.trigger('newMessage');
                this.$el.trigger('reset');
            }.bind(this);

            var error = function(err) {
            }.bind(this);

            asynquence().or(error)
                .then(prepare)
                .then(sendMessage)
                .then(success)
                .val(change);
        }
    },
    onReset: function() {
        this.render();
    }
});

module.exports.id = 'users/partials/inputconversation';
