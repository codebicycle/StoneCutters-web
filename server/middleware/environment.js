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
            var siteLocation = app.getSession('siteLocation');
            var viewType = 'api';
            var pathMatch;

            if (path.indexOf('/api/') == -1) {
                pathMatch = analyticsHelper.getPathMatch(path);
                viewType = config.get(['analytics', 'paths', pathMatch, 'viewType'], '');
            }
            else {
                viewType = 'api';
            }
            if (!siteLocation) {
                siteLocation = (index === -1) ? host : host.substring(0,index);
                siteLocation = siteLocation.replace(siteLocation.slice(0, siteLocation.indexOf('.')),'www');
            }

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
                viewType: viewType,
                url: url,
                clientId: clientId,
                host: host,
                protocol: req.protocol
            });

            next();
        };

    };

};
