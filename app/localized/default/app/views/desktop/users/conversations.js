'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('users/conversations');
var asynquence = require('asynquence');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');
var async = require('async');

module.exports = Base.extend({
    className: 'users_conversations_view',
    events: {
        'click .conversations-thread a': 'markAsRead',
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
    markAsRead: function(event) {
        var threadId = $(event.currentTarget).data('threadid');
        var user = this.app.session.get('user');

        if(!$(event.currentTarget).parent().hasClass('read')) {
            var prepare = function(done) {
               if (!user) {
                    done.abort();
                    return helpers.common.redirect.call(this.app.router, '/login', null, {
                        status: 302
                    });
                }
                done();
            }.bind(this);

            var markRead = function(done) {
                helpers.dataAdapter.post(this.app.req, '/conversations/' + threadId + '/read', {
                    query: {
                        userId: user.userId,
                        token: user.token,
                        platform: 'android',
                        version: '5.0.0'
                    },
                    cache: false,
                    json: true
                }, done.errfcb);
            }.bind(this);

            var error = function(err) {
                console.log('Error :: Mark Message as read');
            }.bind(this);

            asynquence().or(error)
                .then(prepare)
                .then(markRead);
        }
    }
});

module.exports.id = 'users/conversations';
