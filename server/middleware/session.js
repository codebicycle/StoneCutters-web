'use strict';

/**
* This middleware allows accessing the session data from `req.rendrApp`.
* This means that from either the client or server, you can access the session
* data from models, views, and controllers like `this.app.get('session')`.
*/
module.exports = function(dataAdapter) {

    return function loader() {

        return function middleware(req, res, next) {
            var app = req.rendrApp;
            var session = req.session;

            /**
             * Let's keep session data stored in a `data` object, so we don't send metadata
             * like `session.cookie` to the client.
             */
            session.data = session.data || {};
            app.set('session', session.data);

            app.updateSession = function(pairs) {
                for (var key in pairs) {
                    session.data[key] = pairs[key];
                }
                app.set('session', session.data);
            };

            app.getSession = function(key) {
                var data = app.get('session');
                if (!key) {
                    return data;
                }
                return data[key];
            };

            next();
        };

    };

};
