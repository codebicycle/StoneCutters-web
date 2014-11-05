'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var _ = require('underscore');
        var uuid = require('node-uuid');
        var config = require('../../shared/config');
        var deploy = config.get('deploy', {});

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
                _ip = ip.join(',');
            }
            return _ip;
        }

        return function environment(req, res, next) {
            var path = req._parsedUrl.pathname;
            var protocol = req.protocol;
            var url = req.originalUrl;
            var clientId = req.rendrApp.session.get('clientId');
            var referer = req.headers.referer;

            if (typeof clientId === 'undefined') {
                req.rendrApp.session.persist({
                    clientId: uuid.v4()
                });
            }
            req.rendrApp.session.update({
                path: path,
                protocol: protocol,
                url: url,
                referer: referer,
                ip: getIp(req)
            });
            res.locals({
                environment: config.get(['environment', 'type'], 'development'),
                version: deploy.version,
                revision: deploy.revision
            });
            next();
        };

    };

};
