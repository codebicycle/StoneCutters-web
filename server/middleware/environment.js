'use strict';

var config = require('../../app/config');
var analyticsHelper = require('../../app/helpers/analytics');

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {

        return function environment(req, res, next) {
            if (~excludedUrls.indexOf(req.path)) {
                return next();
            }

            var app = req.rendrApp;
            var host = req.headers.host;
            var path = req._parsedUrl.pathname;
            var url = req.originalUrl;
            var referer = app.getSession('url');
            var index = host.indexOf(':');
            var siteLocation = (index === -1) ? host : host.substring(0,index);

            siteLocation = siteLocation.replace(siteLocation.slice(0, siteLocation.indexOf('.')),'www');

            /** If I detect that is not a m.olx.com like URL I will set up arg location
            This is only for testing in Rackspace, must be removed in the near future. */
            (function rackspaceWalkaround() {
                var pointIndex = siteLocation.indexOf('.');
                var firstWord = siteLocation.substring(0, pointIndex);
                siteLocation = (firstWord === 'www') ? siteLocation : 'www.olx.com.ar';
            })();

            req.headers.host = siteLocation;

            var clientId = app.getSession('clientId');

            if (typeof clientId === 'undefined') {
                var c1 = Math.floor(Math.random()*11);
                var c2 = Math.floor(Math.random()*11);
                var n = Math.floor(Math.random()* 1000000);

                clientId = String.fromCharCode(c1)+n+String.fromCharCode(c2);
            }

            app.updateSession({
                siteLocation: siteLocation,
                path: path,
                referer: referer,
                url: url,
                clientId: clientId,
                host: host,
                protocol: req.protocol
            });

            next();
        };

    };

};
