'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var config = require('../config');
        var minify = config.get(['uglify', 'enabled'], true);
        var localization = config.get('localization', {});
        var _ = require('underscore');

        function isLocalized(platform, siteLocation) {
            return !!(localization[platform] && ~localization[platform].indexOf(siteLocation));
        }

        return function middleware(req, res, next) {
            if (_.contains(excludedUrls.all, req.path)) {
                return next();
            }

            var app = req.rendrApp;
            var location = app.getSession('location');
            var siteLocation = app.getSession('siteLocation');
            var userAgent = req.get('user-agent');

            function callback(err, response, body) {
                if (err) {
                    return fail(err);
                }
                var device = body;

                if(device.osVersion === undefined){
                    device.osVersion = '0';
                }

                var marketing = {
                    osName: device.osName,
                    osVersion: parseFloat(device.osVersion.replace('_','.'))
                };
                var directory = 'default';
                var jsDir = minify ? 'min' : 'app';
                var platform = req.subdomains.pop() || 'wap';
                var template;

                if (isLocalized(platform, siteLocation)) {
                    directory = siteLocation;
                }
                template = directory + '/' + platform;
                app.updateSession({
                    device: device,
                    directory: directory,
                    platform: platform,
                    template: template,
                    marketing: marketing,
                    jsDir: jsDir
                });
                app.req.app.locals({
                    device: device,
                    directory: directory,
                    platform: platform,
                    template: template,
                    jsDir: jsDir
                });
                next();
            }

            function fail(err) {
                res.send(400, err);
            }

            dataAdapter.get(req, '/devices/' + encodeURIComponent(userAgent), callback);
        };

    };

};
