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

function setUrlVars() {
    if (typeof window === 'undefined') {
        return;
    }
    var location = window.location;

    this.app.updateSession({
        path: location.pathname,
        url: location.href,
        referer: this.app.getSession('referer')
    });
}

function setCurrentPage() {
    var path = this.app.getSession('path');
    var page;

    if (new RegExp('^.+-p-[\\d]+(/.*)?(\\?.*)?$', 'i').test(path)) {
        page = path.split('/')[1].split('-p-').pop();
    }
    if (page) {
        this.app.persistSession({
            page: page
        });
    }
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
            siteLocation: url
        });
        app.updateSession({
            location: location
        });
        callback();
    });
}

module.exports = {
    control: function(params, callback) {
        setCurrentRoute.call(this);
        setUrlVars.call(this);
        setCurrentPage.call(this);
        setLanguage.call(this);
        setLocation.call(this, params, callback.bind(this));
    },
    setSession: function() {
        setSession.call(this);
    }
};
