'use strict';

var config = require('../../config');
var helpers = require('../../app/helpers');
var _ = require('underscore');

module.exports = function(dataAdapter) {

    return function loader() {

        return function interstitial(req, res, next) {
            var url = '/interstitial';
            var app = req.rendrApp;
            var platform;
            var downloadApp;
            var clicks;
            var currentClicks;

            platform = app.getSession('platform');
            if (platform === 'wap' || req.path === url) {
                return next();
            }

            downloadApp = helpers.cookies.get(req, 'downloadApp', 0);
            if (!downloadApp) {
                clicks = config.get(['interstitial', 'clicks'], 1);
                currentClicks = helpers.cookies.get(req, 'clicks', 0);

                if (currentClicks < clicks) {
                    currentClicks++;
                    helpers.cookies.put(res, 'clicks', currentClicks);

                } else if (!~req.originalUrl.indexOf('/redirect')) {
                    var protocol = app.getSession('protocol');
                    var host = app.getSession('host');
                    var time = config.get(['interstitial', 'time'], 60000);

                    helpers.cookies.put(res, 'clicks', 0);
                    helpers.cookies.put(res, 'downloadApp', 1, {maxAge: time});
                    return res.redirect(url + '?ref=' + protocol + '://' + host + req.originalUrl);
                }
            }
            next();
        };

    };

};
