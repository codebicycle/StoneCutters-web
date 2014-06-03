'use strict';

var cookies = require('./cookies');
var _ = require('underscore');
var session;

function setSession() {
    if (typeof window === 'undefined') {
        return;
    }
    session = _.extend(this.get('session'), cookies.getAll());

    this.updateSession = function(pairs) {
        for (var key in pairs) {
            session[key] = pairs[key];
        }
        this.set('session', session);
    };
    this.persistSession = function(pairs, options) {
        for (var key in pairs) {
            cookies.put(key, pairs[key], options);
        }
        this.updateSession(pairs);
    };
    this.getSession = function(key) {
        if (!key) {
            return session;
        }
        return session[key];
    };
    this.deleteSession = function(key, options) {
        if (!key) {
            return;
        }
        cookies.clear(key, options);
        delete session[key];
        this.set('session', session);
    };
}

module.exports = {
    setSession: function() {
        setSession.call(this);
    }
};
