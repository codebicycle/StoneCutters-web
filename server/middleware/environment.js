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
            var path = req._parsedUrl.pathname;
            var url = req.originalUrl;
            var referer = app.getSession('url');
            var viewType = 'api';
            var pathMatch;

            if (path.indexOf('/api/') == -1) {
                pathMatch = analyticsHelper.getPathMatch(path);
                viewType = config.get(['analytics', 'paths', pathMatch, 'viewType'], '');
            }
            else {
                viewType = 'api';
            }

            var clientId = app.getSession('clientId');

            if (typeof clientId === 'undefined') {
                var c1 = Math.floor(Math.random()*11);
                var c2 = Math.floor(Math.random()*11);
                var n = Math.floor(Math.random()* 1000000);

                clientId = String.fromCharCode(c1)+n+String.fromCharCode(c2);
            }
            app.updateSession({
                path: path,
                referer: referer,
                viewType: viewType,
                url: url,
                clientId: clientId,
                protocol: req.protocol
            });

            next();
        };

    };

};
