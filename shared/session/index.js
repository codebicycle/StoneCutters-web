'use strict';

var _ = require('underscore');
var utils = require('../utils');

if (utils.isServer) {
    var serverSessionModule = './server';
    var ServerSession = require(serverSessionModule);
}
else {
    var ClientSession = require('./client');
}

function Session(isApp, done) {
    done = done || utils.noop;
    if (isApp && utils.isServer) {
        return done();
    }
    this.session = {};
    if (utils.isServer) {
        new ServerSession(this, callback.bind(this));
    }
    else {
        new ClientSession(this, callback.bind(this));
    }

    function callback(store) {
        var session = _.extend({
            isServer: utils.isServer
        }, _.clone(this.get('session') || {}), store.getAll());

        this.session.update = function(pairs) {
            for (var key in pairs) {
                session[key] = pairs[key];
            }
            this.set('session', _.clone(session));
        }.bind(this);

        this.session.persist = function(pairs, options) {
            for (var key in pairs) {
                store.put(key, pairs[key], options);
            }
            this.session.update(pairs);
        }.bind(this);

        this.session.get = function(key) {
            if (!key) {
                return _.clone(session);
            }
            return _.clone(session[key]);
        }.bind(this);

        this.session.clear = function(key, options) {
            if (!key) {
                return;
            }
            store.clear(key, options);
            delete session[key];
            this.set('session', _.clone(session));
        }.bind(this);

        done();
    }
};

module.exports = Session;
