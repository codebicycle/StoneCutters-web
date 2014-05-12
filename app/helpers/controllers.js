'use strict';

var config = require('../config');
var analyticsHelper = require('./analytics');
var cookies = require('./cookies');
var _ = require('underscore');
var session;

function setSession() {
    if (typeof window === 'undefined' || session) {
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
    var url = location.href;
    var path = location.pathname;
    var referer = this.app.getSession('url');
    var pathMatch = analyticsHelper.getPathMatch(path);
    var viewType = config.get(['analytics', 'paths', pathMatch, 'viewType'], '');

    this.app.updateSession({
        path: path,
        referer: referer,
        url: url,
        viewType: viewType
    });
}

function setLocation(params, callback) {
    var app = this.app;
    var location = this.app.getSession('location');
    var previousLocation;
    var spec;

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
        console.log(location);
        console.log(result.city);
        location.city = result.city.toJSON();
        app.persistSession({
            location: location,
            siteLocation: result.city.get('url')
        });
        callback();
    });
}

module.exports = {
    control: function(that, params, callback) {
        setSession.call(that);
        setUrlVars.call(that);
        setLocation.call(that, params, callback.bind(that));
    }
};
