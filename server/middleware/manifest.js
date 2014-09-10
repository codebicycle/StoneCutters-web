'use strict';

module.exports = function(dataAdapter, excludedUrls) {
    return function loader() {
        var manifest = require('../files/manifest');

        return function middleware(req, res, next) {
            if (req.path !== '/manifest.webapp') {
                return next();
            }
            res.json(manifest);
        };
    };
};