'use strict';

var config = require('../config');
var cookies = require('../cookies');
var _ = require('underscore');

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {

        return function interstitial(req, res, next) {
            if (~excludedUrls.indexOf(req.path)) {
                return next();
            }

            var url = '/interstitial';
            var app = req.rendrApp;
            var platform;
            var platforms;
            var paths;
            var downloadApp;
            var clicks;
            var currentClicks;

            platform = app.getSession('platform');
            platforms = config.get(['interstitial', 'ignorePlatform'], []);
            if (_.contains(platforms, platform)) {
                return next();
            }

            paths = config.get(['interstitial', 'ignorePath'], []);
            if (_.contains(paths, req.path)) {
                return next();
            }

            downloadApp = cookies.get(req, 'downloadApp', 0);
            if (!downloadApp) {
                clicks = config.get(['interstitial', 'clicks'], 1);
                currentClicks = cookies.get(req, 'clicks', 0);

                if (currentClicks < clicks) {
                    currentClicks++;
                    cookies.put(res, 'clicks', currentClicks);
                }
                else if (!~req.originalUrl.indexOf('/redirect')) {
                    var protocol = app.getSession('protocol');
                    var host = app.getSession('host');
                    var time = config.get(['interstitial', 'time'], 60000);

                    cookies.put(res, 'clicks', 0);
                    cookies.put(res, 'downloadApp', 1, {
                        maxAge: time
                    });
                    return res.redirect(url + '?ref=' + protocol + '://' + host + req.originalUrl);
                }
            }
            next();
        };

    };

};
