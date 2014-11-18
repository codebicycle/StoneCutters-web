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

            var subdomain = req.subdomains.pop();
            var isMobile = _.contains(mobile, subdomain);

            res.set('Content-Type', 'text/plain; charset=utf-8');
            res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-age=0, max-stale=0, post-check=0, pre-check=0');
            console.log('[OLX_DEBUG]', 'robots', subdomain, isMobile ? 'mobile' : 'desktop');
            res.status(200).sendfile(isMobile ? mRobots : robots);
        };
    };
};
