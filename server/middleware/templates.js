'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var minify = require('../config').get(['uglify', 'enabled'], true);
        var localization = require('../../app/config').get('localization', {});
        var _ = require('underscore');
        var utils = require('../../shared/utils');
        var path = require('path');
        var errorPath = path.resolve('server/templates/error.html');
        var graphite = require('../graphite')();

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
            var userAgent = req.get('user-agent') || utils.defaults.userAgent;

            function callback(err, response, body) {
                if (err) {
                    return fail(err);
                }
                if (!body) {
                    console.log('[OLX_DEBUG] Empty device response: ' + (response ? response.statusCode : 'no response') + ' for ' + userAgent + ' on ' + req.headers.host);
                    return fail(new Error());
                }
                var device = body;

                if (device.browserName == 'Opera Mini') {
                    var alternativeUA = ['device-stock-ua','x-operamini-phone-ua'];
                    var headers = req.headers;
                    var match;

                    for (var i = alternativeUA.length - 1; i >= 0; i--) {
                        if (alternativeUA[i] in headers) {
                            userAgent = headers[alternativeUA[i]];
                            if (device.osName == 'Android') {
                                match = userAgent.match(/Android [\d+\.]{3,5}/);
                                if (match) {
                                    device.osVersion = match[0].replace('Android ','');
                                }
                            }
                            else if (device.osName == 'iOS') {
                                match = userAgent.match(/iPhone OS [\d+\_]{3,5}/);
                                if (match) {
                                    device.osVersion = match[0].replace('iPhone OS ','');
                                }
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
                graphite.send([location.name, 'middleware', 'templates', 'error'], 1, '+');
                res.status(500).sendfile(errorPath);
            }

            dataAdapter.get(req, '/devices/' + encodeURIComponent(userAgent), callback);
        };

    };

};
