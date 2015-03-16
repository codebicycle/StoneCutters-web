'use strict';

var helpers = require('../helpers');

module.exports = function(params, next) {
    var user = this.app.session.get('user');

    if (!user) {
        return next();
    }

    helpers.dataAdapter.get(this.app.req, '/conversations/unread/count', {
        query: {
            token: user.token,
            userId: user.userId,
            location: this.app.session.get('location').url,
            platform: this.app.session.get('platform')
        },
        cache: false,
        json: true
    }, callback.bind(this));

    function callback(err, response, body) {
        if (err) {
            return next.fail(err);
        }
        user.unreadConversationsCount = body.count;
        this.app.session.persist({
            user: user
        });
        next();
    }
};
