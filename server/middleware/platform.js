'use strict';

var _ = require('underscore');
var URLParser = require('url');
var config = require('../config');
var utils = require('../../shared/utils');

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var _ = require('underscore');

        return function platform(req, res, next) {
            if (_.contains(excludedUrls.all, req.path)) {
                return next();
            }
            var userAgent = req.get('user-agent');

            function callback(err, response, body) {
                var platform;

                if (err) {
                    console.log('redirect for err', err);
                    return fail(err);
                }
                platform = body.web_platform || 'wap';
                res.set('Vary', 'User-Agent');
                console.log('redirect to', req.protocol + '://' + platform + '.' + req.headers.host + req.originalUrl);
                res.redirect(302, req.protocol + '://' + platform + '.' + req.headers.host + req.originalUrl);
            }

            function check(err, response, body) {
                var host = req.headers.host;
                var platform;

                if (err) {
                    console.log('redirect for err', err);
                    return fail(err);
                }
                platform = body.web_platform || 'wap';

                if (platform !== req.subdomains.pop()) {
                    host = host.split('.');
                    host.shift();
                    res.set('Vary', 'User-Agent');
                    console.log('redirect to', [req.protocol, '://', platform, '.', host.join('.'), utils.removeParams(req.originalUrl, 'sid')].join(''));
                    return res.redirect(302, [req.protocol, '://', platform, '.', host.join('.'), utils.removeParams(req.originalUrl, 'sid')].join(''));
                }
                console.log('next');
                next();
            }

            function fail(err) {
                res.send(400, err);
            }

            if ((req.subdomains.length === 1 || (req.subdomains.length === 2 && _.contains(config.get('hosts', ['olx']), req.subdomains.shift()))) && 'm' === req.subdomains.pop()) {
                dataAdapter.get(req, '/devices/' + encodeURIComponent(userAgent), callback);
            }
            else if (req.subdomains.length <= 3 && _.contains(config.get('platforms', []), req.subdomains.pop())) {
                if (!~userAgent.indexOf('Googlebot')) {
                    if (req.cookies.forcedPlatform && req.cookies.forcedPlatform !== req.subdomains.pop()) {
                        res.set('Vary', 'User-Agent');

                        return res.redirect(302, req.protocol + '://' + req.cookies.forcedPlatform + '.' + req.headers.host + req.originalUrl);
                    }
                    else if (!req.cookies.forcedPlatform) {
                        if (!req.headers.referer) {
                            return dataAdapter.get(req, '/devices/' + encodeURIComponent(userAgent), check);
                        }
                        else {
                            var refererHost = URLParser.parse(req.headers.referer).hostname;

                            if (refererHost !== req.headers.host.split(':').shift()) {
                                refererHost = (refererHost || '').split('.');

                                if (!_.intersection(config.get('hosts', ['olx']), refererHost).length) {
                                    return dataAdapter.get(req, '/devices/' + encodeURIComponent(userAgent), check);
                                }
                            }
                        }
                    }
                }
                next();
            }
            else {
                var subdomains = req.subdomains.reverse();

                if (_.contains(config.get('hosts', ['olx']), subdomains[subdomains.length - 1])) {
                    subdomains = subdomains.slice(0, subdomains.length - 1);
                }
                res.set('Vary', 'User-Agent');
                res.redirect(301, req.protocol + '://' + req.headers.host.replace(new RegExp('^' + subdomains.join('.'), 'i'), 'm'));
            }
        };

    };

};
