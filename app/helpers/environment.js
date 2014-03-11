'use strict';

var analyticsConfig = require('../config/analytics/analytics_config');

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
    },
    setUrlVars: function(app) {
        var location = window.location;
        var url = location.href;
        var path = location.pathname;
        var viewType = 'unknown';
        var referer = app.getSession('url');

        switch(path){
            //emulate /items/* match
            case '/items/'+ path.slice('/items/'.length): viewType = 'item';
            break;
            default: viewType = analyticsConfig[path].viewType;
            break;
        }
        app.updateSession({
            path: path,
            referer: referer,
            url: url,
            viewType: viewType
        });
    }
};
