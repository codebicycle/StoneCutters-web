'use strict';

var _ = require('underscore');
var URLParser = require('url');
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
                res.set('Vary', 'User-Agent');
                res.redirect(301, req.protocol + '://' + platform + '.' + req.headers.host + req.originalUrl);
            }

            function check(err, response, body) {
                var host = req.headers.host;
                var platform;

                if (err) {
                    return fail(err);
                }
                platform = body.web_platform || 'wap';

                if (platform !== req.subdomains.pop()) {
                    host = host.split('.');
                    host.shift();
                    res.set('Vary', 'User-Agent');
                    res.redirect(302, [req.protocol, '://', platform, '.', host.join('.'), req.originalUrl].join(''));
                    return;
                }
                next();
            }

            function fail(err) {
                res.send(400, err);
            }

            if ((req.subdomains.length === 1 || (req.subdomains.length === 2 && 'olx' === req.subdomains.shift())) && 'm' === req.subdomains.pop()) {
                dataAdapter.get(req, '/devices/' + encodeURIComponent(req.get('user-agent')), callback);
            }
            else if (req.subdomains.length <= 3 && _.contains(config.get('platforms', []), req.subdomains.pop())) {
                if (req.headers.referer) {
                    var referer = URLParser.parse(req.headers.referer).hostname.split('.');

                    if (!_.contains(referer, 'olx')) {
                        dataAdapter.get(req, '/devices/' + encodeURIComponent(req.get('user-agent')), check);
                        return;
                    }
                }
                next();
            }
            else {
                var subdomains = req.subdomains.reverse();

                if (subdomains[subdomains.length - 1] === 'olx') {
                    subdomains = subdomains.slice(0, subdomains.length - 1);
                }
                res.set('Vary', 'User-Agent');
                res.redirect(301, req.protocol + '://' + req.headers.host.replace(new RegExp('^' + subdomains.join('.'), 'i'), 'm'));
            }
        };

    };

};
