'use strict';

module.exports = function(dataAdapter) {

    return function loader() {
        var localizedTemplates = require('../localizedTemplates');

        function isLocalized(platform, location) {
            return !!(~localizedTemplates[platform].indexOf(location));
        }

        return function middleware(req, res, next) {
            var app = req.rendrApp;
            var siteLocation = app.getSession('siteLocation');
            var userAgent = req.get('user-agent');
            var api = {
                body: {},
                url: '/devices/' + encodeURIComponent(userAgent)
            };

            function done(body) {
                var device = body;
                var template = 'basic';
                var platform = 'wap';
                var location = siteLocation.slice(siteLocation.length - 2);

                //if (device.isBrowser) {
                //    platform = 'desktop';
                //}
                //else {
                    platform = device.web_platform;
                //}
                switch(platform) {
                    case 'desktop':
                        //template = 'desktop';
                        template = 'enhanced';
                    break;
                    case 'html5':
                        template = 'enhanced';
                    break;
                    case 'html4':
                        template = 'standard';
                    break;
                    case 'wap':
                        template = 'basic';
                    break;
                    default:
                        template = 'basic';
                    break;
                }
                if (isLocalized(platform, location)) {
                    template += '_' + location;
                }
                app.updateSession({
                    updateRequired: platform !== app.getSession('lastPlatform'),
                    platform: platform,
                    lastPlatform: platform,
                    template: template
                });
                app.req.app.locals({
                    platform: platform,
                    template: template
                });
                next();
            }

            function fail(error) {
                console.log('Got error: ' + error.err);
                res.send(400, error.err);
            }

            console.log('<DEBUG CONSOLE LOG> Hitting SMAUG to know the platform');
            dataAdapter.promiseRequest(req, api, done, fail);
        };

    };

};
