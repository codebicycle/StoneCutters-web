'use strict';

module.exports = function(dataAdapter, excludedUrls) {
    return function loader() {
        var path = require('path');
        var robots = path.resolve('server/templates/robots.txt');

        return function middleware(req, res, next) {
            if (req.path !== '/robots.txt') {
                return next();
            }
            res.set('Content-Type', 'text/plain');
            res.status(200).sendfile(robots);
        };
    };
};
