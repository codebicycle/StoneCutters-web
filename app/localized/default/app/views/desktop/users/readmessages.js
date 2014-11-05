'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('users/readmessages');
var asynquence = require('asynquence');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'users_readmessages_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        this.message = this.message || data.context.ctx.message;
        return _.extend({}, data, {
            message: this.message
        });
    },
    events: {
        'submit': 'onSubmit'
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $form = $('[data-message-reply]');
        var message = $form.find('[data-messageText]').val();
        var user = this.app.session.get('user');

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
            }, done);
        }.bind(this);

        var success = function(response) {
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
            .then(prepare)
            .then(sendMessage)
            .val(success);
    }
});

module.exports.id = 'users/readmessages';