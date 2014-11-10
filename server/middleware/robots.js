'use strict';

module.exports = function(dataAdapter, excludedUrls) {
    return function loader() {
        var _ = require('underscore');
        var path = require('path');
        var robots = path.resolve('server/files/robots/web.txt');
        var mRobots = path.resolve('server/files/robots/mobile.txt');
        var mobile = ['m', 'wap', 'html4', 'html5'];

        return function middleware(req, res, next) {
            if (req.path !== '/robots.txt') {
                return next();
            }
            res.set('Content-Type', 'text/plain');
            res.status(200).sendfile(_.contains(mobile, req.subdomains.pop()) ? mRobots : robots);
        };
    };
};
