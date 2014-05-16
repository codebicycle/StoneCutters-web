'use strict';

var config = require('../../app/config');
var uuid = require('node-uuid');

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var _ = require('underscore');

        return function environment(req, res, next) {
            if (_.contains(excludedUrls.all, req.path)) {
                return next();
            }

            var app = req.rendrApp;
            var path = req._parsedUrl.pathname;
            var protocol = req.protocol;
            var host = req.headers.host;
            var url = req.originalUrl;
            var referer = req.headers.referer;
            var clientId = app.getSession('clientId');

            if (referer && url.indexOf('/pageview.gif') !== 0) {
                referer = referer.replace(new RegExp('^' + protocol + '://' + host, 'gi'), '');
            }
            if (typeof clientId === 'undefined') {
                app.persistSession({
                    clientId: uuid.v4()
                });
            }
            app.updateSession({
                path: path,
                protocol: protocol,
                host: host,
                url: url,
                referer: referer || '/'
            });
            next();
        };

    };

};
