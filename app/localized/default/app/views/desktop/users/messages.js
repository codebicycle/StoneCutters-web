'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('users/messages');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');
var async = require('async');

module.exports = Base.extend({
    className: 'users_messages_view',
    events: {
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
    postRender: function() {
        var sent = this.app.session.get('params').sent;
        var $alert = $('[message-alert]');

        if (sent !== undefined) {
            if (sent === "true") {
                $('[message-alert-success]').show();
                $('[message-alert-fail]').hide();
            } else {
                $('[message-alert-success]').hide();
                $('[message-alert-fail]').show();
            }
            
            $alert.show().delay( 4000 ).slideUp( 600 );
        }
    },
    selectAll: function(event) {
        var $selectAll = $(event.target);
        var $inputs = $('[data-message] input');
        var check = $selectAll.is(':checked');
        
        if (check) {
            $($inputs).prop('checked', true);
        } else {
            $($inputs).prop('checked', false);            
        }
    },
    deleteMessage: function() {
        var $messages = $('[data-message] input:checked');
        var messageId;
        var _app = this.app;
        var user = _app.session.get('user');
        var url;

        async.each($($messages), function each(message, callback) {
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
        });
    }
});

module.exports.id = 'users/messages';