'use strict';

module.exports = function(dataAdapter, excludedUrls) {
    return function loader() {
        var _ = require('underscore');

        return function middleware(req, res, next) {
            var originalUrl = req.originalUrl.split('/');
            var language = originalUrl[1];

            if (!language || language.length !== 2) {
                return next();
            }
            originalUrl = _.rest(originalUrl, 2);
            originalUrl.unshift('');
            res.redirect(originalUrl.join('/'));
        };
    };
};
