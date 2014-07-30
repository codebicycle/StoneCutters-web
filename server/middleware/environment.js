'use strict';

var uuid = require('node-uuid');

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var _ = require('underscore');
        var uuid = require('node-uuid');
        var crypto = require('crypto');
        var utils = require('../../shared/utils');
        var analytics = require('../../app/analytics');

        function generateGuid(req) {
            var guid = req.header('HTTP_X_DCMGUID');

            if (!guid) {
                guid = req.header('HTTP_X_UP_SUBNO');
            }
            if (!guid) {
                guid = req.header('HTTP_X_JPHONE_UID');
            }
            if (!guid) {
                guid = req.header('HTTP_X_EM_UID');
            }
            return guid;
        }
        
        function generateVisitorId(req) {
            var guid = generateGuid(req);
            var visitorId;

            if (guid) {
                visitorId = guid + analytics.google.getId();
            } 
            else {
                visitorId = (req.get('user-agent') || '') + uuid.v1();
            }
            return '0x' + crypto
                .createHash('md5')
                .update(visitorId, 'utf8')
                .digest('hex')
                .substr(0, 16);
        }

        return function environment(req, res, next) {
            if (_.contains(excludedUrls.all, req.path)) {
                return next();
            }

            var path = req._parsedUrl.pathname;
            var protocol = req.protocol;
            var host = req.headers.host;
            var url = req.originalUrl;
            var clientId = req.rendrApp.session.get('clientId');
            var visitorId = req.rendrApp.session.get('visitorId');
            var referer = req.headers.referer;
            var platform = req.rendrApp.session.get('forcedPlatform') || req.subdomains.pop() || utils.defaults.platform;

            if (typeof clientId === 'undefined') {
                req.rendrApp.session.persist({
                    clientId: uuid.v4()
                });
            }
            if (typeof visitorId === 'undefined') {
                req.rendrApp.session.persist({
                    visitorId: generateVisitorId(req)
                });
            }
            req.rendrApp.session.update({
                path: path,
                protocol: protocol,
                host: host,
                url: url,
                referer: referer,
                platform: platform
            });
            req.rendrApp.req.app.locals({
                platform: platform
            });
            next();
        };

    };

};
