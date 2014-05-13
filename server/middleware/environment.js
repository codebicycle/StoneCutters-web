'use strict';

var config = require('../../app/config');
var uuid = require('node-uuid');

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
            var clientId = app.getSession('clientId');

            if (typeof clientId === 'undefined') {
                clientId = new Buffer(32);
                uuid.v4(null, clientId);
                clientId = uuid.unparse(clientId);
                app.persistSession({
                    clientId: clientId
                });
            }
            app.updateSession({
                path: path,
                referer: referer,
                url: url,
                clientId: clientId,
                protocol: req.protocol
            });

            next();
        };

    };

};
