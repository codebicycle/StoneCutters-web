'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('users/conversation');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');
var async = require('async');

module.exports = Base.extend({
    className: 'users_conversation_view',
    events: {
        'submit': 'onSubmit',
        'click [data-delete-message]': 'deleteMessage',
        'click [data-select-all]': 'selectAll'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        this.messages = this.messages || data.context.ctx.messages;

        return _.extend({}, data, {
            messages: this.messages
        });
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $form = $('[data-message-reply]');
        var message = $form.find('[data-messageText]').val();
        var user = this.app.session.get('user');

        $('[data-error]').addClass('hide');
        
        var validate = function(done) {
            if (message === "") {
                $('[data-error]').removeClass('hide');
                done.abort();
            }
            else {
                done();
            }
        }.bind(this);

        var prepare = function(done) {
            user = this.app.session.get('user');
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
            helpers.dataAdapter.post(this.app.req, '/messages', {
                query: {
                    token: user.token
                },
                data: {
                    userId: user.userId,
                    messageId: $form.data('messageId'),
                    message: message,
                    name: user.username
                },
                cache: false,
                json: true
            }, done.errfcb);
        }.bind(this);

        var success = function() {
            helpers.common.redirect.call(this.app.router, '/myolx/myolxmessages', null, {
                status: 302,
                query: {
                    sent: true
                }
            });
        }.bind(this);

        var error = function(err) {
            helpers.common.redirect.call(this.app.router, '/myolx/myolxmessages', null, {
                status:302,
                query: {
                    sent: false
                }
            });
        }.bind(this);

        asynquence().or(error)
            .then(validate)
            .then(prepare)
            .then(sendMessage)
            .val(success);
    },
    postRender: function() {
        var sent = this.app.session.get('params').sent;

        if (sent !== undefined) {
            if (sent === "true") {
                $('[message-alert-success]').show();
                $('[message-alert-fail]').hide();
            } else {
                $('[message-alert-success]').hide();
                $('[message-alert-fail]').show();
            }

            $('[message-alert]').show().delay( 4000 ).slideUp( 600 );
        }
    },
    selectAll: function(event) {
        var selectAll = $(event.target);
        var inputs = $('[data-message] input');
        var check = selectAll.is(':checked');

        if (check) {
            $(inputs).prop('checked', true);
        } else {
            $(inputs).prop('checked', false);
        }
    },
    deleteMessage: function() {
        var messages = $('[data-message] input:checked');
        var messageId;
        var _app = this.app;
        var user = _app.session.get('user');
        var url;

        async.each($(messages), function each(message, callback) {
            messageId = $(message).data('messageId');
            url = [];
            url.push('/users/');
            url.push(user.userId);
            url.push('/messages/');
            url.push(messageId);
            url.push('/delete');
            url.push('?token=');
            url.push(user.token);

            helpers.dataAdapter.post(_app.req, url.join(''), {
                cache: false,
                json: true,
                done: function() {
                    callback();
                },
                fail: function() {
                    callback('[OLX_DEBUG] Fail delete Message :: ERROR');
                }
            });
        }, function callback(err) {
            this.render();
        }.bind(this));
    }
});

module.exports.id = 'users/conversation';
