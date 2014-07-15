'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var minify = require('../config').get(['uglify', 'enabled'], true);
        var localization = require('../../app/config').get('localization', {});
        var _ = require('underscore');

        function isLocalized(platform, siteLocation) {
            return !!(localization[platform] && ~localization[platform].indexOf(siteLocation));
        }

        return function middleware(req, res, next) {
            if (_.contains(excludedUrls.all, req.path)) {
                return next();
            }

            var app = req.rendrApp;
            var location = app.session.get('location');
            var siteLocation = app.session.get('location').url;
            var userAgent = req.get('user-agent');

            function callback(err, response, body) {
                if (err) {
                    return fail(err);
                }
                var device = body;

                if (device.browserName == 'Opera Mini') {
                    var alternativeUA = ['device-stock-ua','x-operamini-phone-ua'];
                    var headers = req.headers;

                    for (var i = alternativeUA.length - 1; i >= 0; i--) {
                        if (alternativeUA[i] in headers) {
                            userAgent = headers[alternativeUA[i]];
                            if (device.osName == 'Android') {
                                device.osVersion = userAgent.match(/Android [\d+\.]{3,5}/)[0].replace('Android ','');
                            }
                            else if (device.osName == 'iOS') {
                                device.osVersion = userAgent.match(/iPhone OS [\d+\_]{3,5}/)[0].replace('iPhone OS ','');
                            }
                        }
                    }
                }

                if (device.osVersion === undefined) {
                    device.osVersion = '0';
                }

                var marketing = {
                    osName: device.osName,
                    osVersion: parseFloat(String(device.osVersion).replace('_','.')),
                    browserName: device.browserName
                };
                var directory = 'default';
                var jsDir = '/js/' + (minify ? 'min' : 'src');
                var platform = req.cookies.forcedPlatform || req.subdomains.pop() || 'wap';
                var template;

                if (isLocalized(platform, siteLocation)) {
                    directory = siteLocation;
                }
                template = directory + '/' + platform;
                app.session.update({
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
