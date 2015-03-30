'use strict';

var helpers = require('../helpers');

module.exports = function(params, next) {
    var user = this.app.session.get('user');
    var messages = this.app.session.get('messages') || false;
    var query = {};
    /*this.app.session.persist({
        messages: '4eswsGi5zgOHlSYD72wpf101fcyIvCWhZ2Kd21hXMmxfYrRXk2KWkpZrXfvov3emgzXUWiy%2F45V%2Bc5yG8OoM8uTTteQFxkj%2Bw8%2Bzf4jfKxqINOFH%2B2ERvqpev%2BMlU6YBegCB6uRHhq0ikj%2Bkogsb%2FFK8r0IH0YJ65JBU4Z0IhggRMx47V2UvXKUp%2FT3i4iqQ'
    });*/

    if (!user && messages) {
        query = {
            hash: 'hash',
            location: this.app.session.get('location').url,
            platform: this.app.session.get('platform')
        }
        console.log(messages);
        console.log(query);
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
            return next();
        }
        user.unreadConversationsCount = body.count;
        this.app.session.persist({
            user: user
        });
        next();
    }
};


