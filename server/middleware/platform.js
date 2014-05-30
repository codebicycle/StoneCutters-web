'use strict';

var config = require('../config');

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

            if ((req.subdomains.length === 1 || (req.subdomains.length === 2 && 'olx' === req.subdomains.shift())) && 'm' === req.subdomains.pop()) {
                dataAdapter.get(req, '/devices/' + encodeURIComponent(req.get('user-agent')), callback);
            }
            else if (req.subdomains.length === 3 && _.contains(config.get('platforms', []), req.subdomains.pop())) {
                next();
            }
            else {
                var subdomains = req.subdomains.reverse();

                if (subdomains.pop() === 'olx') {
                    subdomains = subdomains.slice(0, subdomains.length);
                }
                res.redirect(req.protocol + '://' + req.headers.host.replace(new RegExp('^' + subdomains.join('.'), 'i'), 'm'));
            }
        };

    };

};
