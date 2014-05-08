'use strict';

var config = require('../config');
var analyticsHelper = require('./analytics');
var cookies = require('./cookies');
var _ = require('underscore');
var session;

module.exports = {
    init: function(app) {
        this.setSession(app);
        this.setUrlVars(app);
        return app;
    },
    setSession: function(app) {
        if (typeof window === 'undefined' || session) {
            return;
        }
        session = _.extend(app.get('session'), cookies.getAll());

        app.updateSession = function(pairs) {
            for (var key in pairs) {
                session[key] = pairs[key];
            }
            app.set('session', session);
        };
        app.persistSession = function(pairs, options) {
            for (var key in pairs) {
                cookies.put(key, pairs[key], options);
            }
            app.updateSession(pairs);
        };
        app.getSession = function(key) {
            if (!key) {
                return session;
            }
            return session[key];
        };
        app.deleteSession = function(key, options) {
            if (!key) {
                return;
            }
            cookies.clear(key, options);
            delete session[key];
            app.set('session', session);
        };
    },
    setUrlVars: function(app) {
        if (typeof window === 'undefined') {
            return;
        }
        var location = window.location;
        var url = location.href;
        var path = location.pathname;
        var referer = app.getSession('url');
        var pathMatch = analyticsHelper.ati.getPathMatch(path);
        var viewType = config.get(['analytics', 'paths', pathMatch, 'viewType'], '');

        app.updateSession({
            path: path,
            referer: referer,
            url: url,
            viewType: viewType
        });
    },
    updateCity: function(app, cityId) {
        var location = app.getSession('location');
        var city = location.cities._byId[cityId];

        if (city) {
            location.city = city;
            app.persistSession({
                siteLocation: city.url
            });
        }
    },
};
