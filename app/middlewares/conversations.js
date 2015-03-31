'use strict';

var helpers = require('../helpers');

module.exports = function(params, next) {
    var user = this.app.session.get('user');
    //var hash = this.app.session.get('hash') || false;
    var hash = false;
    var query = {
        location: this.app.session.get('location').url,
        platform: this.app.session.get('platform')
    };
    var url;

    if (!user && !hash) {
        return next();
    }
    else if (user) {
        query.token = user.token;
        query.userId = user.userId;

        url = '/conversations/unread/count';
    }
    else if (hash) {
        query.hash = hash;
        url = '/conversations/unread/count';
    }

    helpers.dataAdapter.get(this.app.req, url, {
        query: query,
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


