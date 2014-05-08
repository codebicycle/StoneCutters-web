'use strict';

/**
* This middleware allows accessing the session data from `req.rendrApp`.
* This means that from either the client or server, you can access the session
* data from models, views, and controllers like `this.app.get('session')`.
*/
module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var cookies = require('../cookies');
        var _ = require('underscore');

        return function middleware(req, res, next) {
            if (~excludedUrls.indexOf(req.path)) {
                return next();
            }

            var app = req.rendrApp;
            var session = _.clone(cookies.getAll(req));

            app.updateSession = function(pairs) {
                for (var key in pairs) {
                    session[key] = pairs[key];
                }
                app.set('session', session);
            };

            app.persistSession = function(pairs, options) {
                for (var key in pairs) {
                    cookies.put(res, key, pairs[key], options);
                    session[key] = pairs[key];
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
                cookies.clear(res, key, options);
                delete session[key];
                app.set('session', session);
            };

            app.set('session', session);
            next();
        };

    };

};
