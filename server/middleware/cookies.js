'use strict';

module.exports = function(dataAdapter, excludedUrls) {
    return function loader() {
        var _ = require('underscore');

        return function middleware(req, res, next) {
            if (_.contains(excludedUrls.all, req.path)) {
                return next();
            }
            if (!req.headers.cookie) {
                return next();
            }
            req.headers.cookie.split(';').forEach(function each(cookie) {
                res.clearCookie(cookie.split('=').shift());
            });
            next();
        };
    };
};
