'use strict';

var config = require('../config');
var analyticsHelper = require('./analytics');
var cookies = require('./cookies');
var _ = require('underscore');
var session;

function setSession() {
    session = _.extend(this.app.get('session'), cookies.getAll());

    this.app.updateSession = function(pairs) {
        for (var key in pairs) {
            session[key] = pairs[key];
        }
        this.set('session', session);
    };
    this.app.persistSession = function(pairs, options) {
        for (var key in pairs) {
            cookies.put(key, pairs[key], options);
        }
        this.updateSession(pairs);
    };
    this.app.getSession = function(key) {
        if (!key) {
            return session;
        }
        return session[key];
    };
    this.app.deleteSession = function(key, options) {
        if (!key) {
            return;
        }
        cookies.clear(key, options);
        delete session[key];
        this.set('session', session);
    };
}

function setUrlVars() {
    var location = window.location;
    var url = location.href;
    var path = location.pathname;
    var referer = this.app.getSession('url');

    this.app.updateSession({
        path: path,
        referer: referer,
        url: url
    });
}

function setLocation(params, callback) {
    var app = this.app;
    var location = this.app.getSession('location');
    var previousLocation;
    var spec;
    var url;

    if (!params || !params.location) {
        return callback();
    }
    previousLocation = this.app.getSession('siteLocation');
    if (previousLocation === params.location) {
        return callback();
    }
    spec = {
        city: {
            model: 'City',
            params: {
                location: params.location
            }
        }
    };
    this.app.fetch(spec, function afterFetch(err, result) {
        if (err) {
            return callback();
        }
        url = result.city.get('url');
        if (location.url.split('.').pop() !== url.split('.').pop()) {
            window.location = '/';
            return;
        }
        location.city = result.city.toJSON();
        app.persistSession({
            location: location,
            siteLocation: url
        });
        callback();
    });
}

module.exports = {
    control: function(that, params, callback) {
        callback = callback.bind(that);
        if (typeof window === 'undefined') {
            return callback();
        }
        setSession.call(that);
        setUrlVars.call(that);
        setLocation.call(that, params, callback);
    }
};
