'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('users/conversation');
var Thread = require('../../../../../../models/conversation');
var asynquence = require('asynquence');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');
var async = require('async');

module.exports = Base.extend({
    className: 'users_conversation_view',
    events: {
        'submit': 'onSubmit'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        data.thread = this.parentView.getThread();
        return data;
    },
    postRender: function() {
        if (!this.rendered) {
            this.parentView.getThread().on('change', this.onChange, this);
        }
        this.rendered = true;
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $form = $('.conversation-input form');
        var message = $form.find('[data-messageText]').val();
        var threadId = $form.attr('data-threadId');
        var user = this.app.session.get('user');

        $('[data-error]').addClass('hide');
        
        var validate = function(done) {
            if (!message) {
                $('[data-error]').removeClass('hide');
                return done.abort();
            }
            done();
        }.bind(this);

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
            $form.find('.spinner, .reply-send').toggle();
            helpers.dataAdapter.post(this.app.req, '/conversations/' + threadId + '/reply', {
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
                        threadId: threadId
                    }
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var change = function(res) {
            this.parentView.getThread().set(res.thread.toJSON());
        }.bind(this);

        var error = function(err) {
        }.bind(this);

        asynquence().or(error)
            .then(validate)
            .then(prepare)
            .then(sendMessage)
            .then(success)
            .val(change);
    },
    onChange: function() {
        this.render();
    }
});

module.exports.id = 'users/conversation';
