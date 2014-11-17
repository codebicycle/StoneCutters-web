'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var Session = require('../../shared/session');

        return function middleware(req, res, next) {
            Session.call(req.rendrApp, false, next);
        };

    };

};
