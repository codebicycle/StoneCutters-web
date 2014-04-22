'use strict';

module.exports = function(dataAdapter) {

    return function loader() {
        var localization = require('../config').get('localization');

        function isLocalized(platform, siteLocation) {
            return !!(~localization[platform].indexOf(siteLocation));
        }

        return function middleware(req, res, next) {
            var app = req.rendrApp;
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
                    template = siteLocation + '/' + platform;
                }
                else {
                    template = 'default/' + platform;
                }
                app.updateSession({
                    platform: platform,
                    template: template,
                    marketing: marketing,
                });
                app.req.app.locals({
                    platform: platform,
                    template: template,
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
