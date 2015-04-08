'use strict';

var helpers = require('../helpers');
var utils = require('../../shared/utils');

module.exports = function(params, next) {
    var user = this.app.session.get('user');
    var hash = this.app.session.get('hash');
    var query = {
        location: this.app.session.get('location').url,
        platform: this.app.session.get('platform')
    };

    if (!user && !hash) {
        this.app.session.clear('messages');
        return next();
    }
    else if (user) {
        query.token = user.token;
        query.userId = user.userId;
        if (hash) {
            this.app.session.clear('messages');
            this.app.session.clear('hash');
        }
    }
    else if (hash) {
        query.email = decodeURIComponent(hash);
    }

    helpers.dataAdapter.get(this.app.req, '/conversations/unread/count', {
        query: query,
        cache: false,
        json: true
    }, callback.bind(this));

    function callback(err, response, body) {
        if (err) {
            return next();
        }
        if (user) {
            user.unreadConversationsCount = body.count;
            this.app.session.persist({
                user: user
            });
        }
        else {
            this.app.session.persist({
                messages : body.count
            });
        }
        next();
    }

};


