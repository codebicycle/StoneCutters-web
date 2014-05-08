'use strict';

var config = require('../config');
var analyticsHelper = require('./analytics');

module.exports = {
    init: function(app) {
        if (typeof window === 'undefined') {
            return app;
        }
        this.setSession(app);
        this.setUrlVars(app);
        return app;
    },
    setSession: function(app) {
        var data = app.get('session');

        if (!app.updateSession) {
            app.updateSession = function(pairs) {
                for (var key in pairs) {
                    data[key] = pairs[key];
                }
                app.set('session', data);
            };
        }
        if (!app.getSession) {
            app.getSession = function(key) {
                if (!key) {
                    return data;
                }
                return data[key];
            };
        }
        if (!app.deleteSession) {
            app.deleteSession = function(key) {
                if (key) {
                    delete data[key];
                }
                app.set('session', data);
            };
        }
    },
    setUrlVars: function(app) {
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
            app.updateSession({
                siteLocation: city.url
            });
        }
    },
};
