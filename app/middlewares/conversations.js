'use strict';

var asynquence = require('asynquence');
var helpers = require('../helpers');
var utils = require('../../shared/utils');

module.exports = function(params, next) {
    var user = this.app.session.get('user');

    asynquence().or(next)
        .then(prepare)
        .then(fetch)
        .val(success);

    function prepare(done) {
        var hash = this.app.session.get('hash');
        var query = {
            location: this.app.session.get('location').url,
            platform: this.app.session.get('platform')
        };

        if (!user && !hash) {
            done.abort();
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
        done(query);
    }

    function fetch(done, query) {
        helpers.dataAdapter.get(this.app.req, '/conversations/unread/count', {
            query: query,
            cache: false,
            json: true
        }, done.errfcb);
    }

    function success(response, body) {
        if (body && body.count !== undefined) {
            if (user) {
                user.unreadConversationsCount = body.count;
                this.app.session.persist({
                    user: user
                });
            }
            else {
                this.app.session.persist({
                    messages: body.count
                });
            }
        }
        next();
    }
};
