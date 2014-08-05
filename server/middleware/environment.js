'use strict';

var uuid = require('node-uuid');

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var _ = require('underscore');
        var uuid = require('node-uuid');
        var utils = require('../../shared/utils');

        function getIp(req) {
            var ip = req.header('HTTP_X_PROXY_X_NETLI_FORWARDED_FOR');

            if (!ip) {
                ip = req.header('HTTP_X_FORWARDED_FOR');

                if(!ip) {
                    ip = req.ip;
                }
                ip = ip.split(',').pop();
            }
            return ip;
        }

        return function environment(req, res, next) {
            var path = req._parsedUrl.pathname;
            var protocol = req.protocol;
            var host = req.headers.host;
            var url = req.originalUrl;
            var clientId = req.rendrApp.session.get('clientId');
            var referer = req.headers.referer;
            var platform = req.rendrApp.session.get('forcedPlatform') || req.subdomains.pop() || utils.defaults.platform;

            if (typeof clientId === 'undefined') {
                console.log('new Client id');
                req.rendrApp.session.persist({
                    clientId: uuid.v4()
                });
            }
            req.rendrApp.session.update({
                path: path,
                protocol: protocol,
                host: host,
                url: url,
                referer: referer,
                platform: platform,
                ip: getIp(req)
            });
            req.rendrApp.req.app.locals({
                platform: platform
            });
            next();
        };

    };

};
