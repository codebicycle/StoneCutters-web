'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('users/conversations');
var _ = require('underscore');
var asynquence = require('asynquence');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    className: 'users_conversations_view',
    events: {
        'click .conversations-thread a': 'markAsRead'
    },
    markAsRead: function(event) {
        var $this = $(event.currentTarget);
        var threadId = $this.data('threadid');
        var user = this.app.session.get('user');

        if ($this.find('.conversations-data').hasClass('unread')) {
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
                        platform: this.app.session.get('platform')
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
