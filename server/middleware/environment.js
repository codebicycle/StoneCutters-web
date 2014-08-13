'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var _ = require('underscore');
        var uuid = require('node-uuid');
        var utils = require('../../shared/utils');
        var config = require('../../shared/config');

        function getIp(req) {
            var ip = req.header('x-forwarded-for');

            if (!ip && req.connection) {
                ip = req.connection.remoteAddress;
            }
            if (!ip && req.socket) {
                ip = req.socket.remoteAddress;
            }
            if (!ip && req.connection && req.connection.socket) {
                ip = req.connection.socket.remoteAddress;
            }
            if (!ip) {
                ip = '1.1.1.1';
            }
            if (!Array.isArray(ip)) {
                ip = ip.split(',');
            }
            var _ip = _.find(ip, function each(_ip) {
                return !!(_ip.indexOf('192.') && _ip.indexOf('10.'));
            });
            if (!_ip) {
                console.log('[OLX_DEBUG]', ip.join(','), _.keys(req.headers).join(',') , _.values(req.headers).join(','));
                _ip = ip.join(',');
            }
            return _ip;
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
                platform: platform,
                environment: config.get(['environment', 'type'], 'development')
            });
            next();
        };

    };

};
