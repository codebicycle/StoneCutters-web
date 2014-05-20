'use strict';

var config = require('../../app/config');

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var _ = require('underscore');

        return function platform(req, res, next) {
            if (_.contains(excludedUrls.all, req.path)) {
                return next();
            }

            function callback(err, response, body) {
                var platform;

                if (err) {
                    return fail(err);
                }
                platform = body.web_platform || 'wap';
                res.redirect(req.protocol + '://' + platform + '.' + req.headers.host + req.originalUrl);
            }

            function fail(err) {
                res.send(400, err);
            }

            if ('m' === req.subdomains.pop()) {
                dataAdapter.get(req, '/devices/' + encodeURIComponent(req.get('user-agent')), callback);
            }
            else {
                next();
            }
        };

    };

};
