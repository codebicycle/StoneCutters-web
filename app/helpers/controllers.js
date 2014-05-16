'use strict';

var config = require('../config');
var analyticsHelper = require('./analytics');
var cookies = require('./cookies');
var _ = require('underscore');
var session;

function setSession() {
    if (typeof window === 'undefined') {
        return;
    }
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
    if (typeof window === 'undefined') {
        return;
    }
    var location = window.location;

    this.app.updateSession({
        path: location.pathname,
        url: location.href,
        referer: this.app.getSession('referer') || '/'
    });
}

function setLanguage(params) {
    if (typeof window === 'undefined') {
        return;
    }
    var languages = this.app.getSession('languages');
    var selectedLanguage = this.app.getSession('selectedLanguage');

    if (!params || !params.language || selectedLanguage === params.language || !languages._byId[params.language]) {
        return;
    }
    this.app.persistSession({
        selectedLanguage: params.language
    });
}

function setCurrentRoute() {
    this.app.updateSession({
        currentRoute: this.currentRoute
    });
}

function setLocation(params, callback) {
    if (typeof window === 'undefined') {
        return callback();
    }
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
        location: {
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
        url = result.location.get('url');
        if (location.url.split('.').pop() !== url.split('.').pop()) {
            window.location = '/';
            return;
        }
        location.current = result.location.toJSON();
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
        setSession.call(that);
        setCurrentRoute.call(that);
        setUrlVars.call(that);
        setLanguage.call(that);
        setLocation.call(that, params, callback);
    }
};
