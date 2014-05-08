'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var config = require('../config');
        var minify = config.get(['uglify', 'enabled'], true);
        var localization = config.get('localization');
        var graphite = require('../graphite')();

        function isLocalized(platform, siteLocation) {
            return !!(~localization[platform].indexOf(siteLocation));
        }

        return function middleware(req, res, next) {
            if (~excludedUrls.indexOf(req.path)) {
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
                var platform;
                var template;

                if(app.getSession('platformForced')) {
                    platform = app.getSession('platform') || 'wap';
                }
                else {
                    /*if (device.isBrowser) {
                        platform = 'desktop';
                    }
                    else {*/
                        platform = device.web_platform || 'wap';
                    //}
                }
                if (isLocalized(platform, siteLocation)) {
                    directory = siteLocation;
                }
                template = directory + '/' + platform;
                app.updateSession({
                    directory: directory,
                    platform: platform,
                    template: template,
                    marketing: marketing,
                    jsDir: jsDir
                });
                app.req.app.locals({
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
