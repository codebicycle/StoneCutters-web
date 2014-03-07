'use strict';

/**
  * This middleware demonstrates updating session data. Increment a counter
  * for every page hit. Test it out by executing `App.get('session')` in
  * the console of the web browser.
  */
module.exports = function(dataAdapter) {

    return function loader() {

        return function middleware(req, res, next) {
            var app = req.rendrApp;
            var count = app.getSession('count') || 0;

            app.updateSession({
                count: count + 1
            });
            next();
        };

    };

};
