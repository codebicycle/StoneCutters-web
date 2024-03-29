'use strict';

var asynquence = require('asynquence');
var helpers = require('../helpers');
var utils = require('../../shared/utils');

module.exports = function(params, next) {
    var user = this.app.session.get('user');

    asynquence().or(next)
        .then(prepare.bind(this))
        .then(fetch.bind(this))
        .val(success.bind(this));

    function prepare(done) {
        var hash = this.app.session.get('hash');
        var query = {
            location: this.app.session.get('location').url,
            platform: this.app.session.get('platform')
        };
        var isHermesEnabled = helpers.features.isEnabled.call(this, 'hermes');

        if (!isHermesEnabled) {
            done.abort();
            return next();
        }
        if (!user && !hash) {
            done.abort();
            this.app.session.clear('messages');
            this.app.session.clear('showNotification');
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
                if (user.unreadConversationsCount < body.count) {
                    this.app.session.persist({
                        showNotification: body.count
                    });
                }
                else {
                    this.app.session.clear('showNotification');
                }
                user.unreadConversationsCount = body.count;
                this.app.session.persist({
                    user: user
                });
            }
            else {
                var messages = this.app.session.get('messages');
                if (messages < body.count) {
                    this.app.session.persist({
                        showNotification: body.count
                    });
                }
                else {
                    this.app.session.clear('showNotification');
                }
                this.app.session.persist({
                    messages: body.count
                });
            }
        }
        next();
    }
};
