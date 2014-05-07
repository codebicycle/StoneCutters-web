'use strict';

var config = require('../../app/config');

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {

        return function environment(req, res, next) {

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
