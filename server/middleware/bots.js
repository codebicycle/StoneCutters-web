'use strict';

module.exports = function(dataAdapter, excludedUrls) {
    return function loader() {
        var _ = require('underscore');
        var utils = require('../../shared/utils');
        var bots = {
            'Mozilla/5.0 (compatible; Googlebot/2.1;+http://www.google.com/bot.html)': {
                isBrowser: 1,
                web_platform: 'desktop'
            }
        };
        var userAgents = Object.keys(bots);

        return function middleware(req, res, next) {
            var userAgent = utils.getUserAgent(req);

            if (_.contains(userAgents, userAgent)) {
                req.rendrApp.get('session').device = bots[userAgent];
            }
            next();
        };
    };
};
