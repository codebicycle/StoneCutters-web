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
        return next();
    }
    else if (user) {
        query.token = user.token;
        query.userId = user.userId;
    }
    else if (hash) {
        query.email = hash;
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
                //messages : body.count
                messages: 10
            });
        }
        next();
    }

};


