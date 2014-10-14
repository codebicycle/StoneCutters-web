'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var _ = require('underscore');
        var path = require('path');
        var URLParser = require('url');
        var config = require('../config');
        var statsd  = require('../modules/statsd')();
        var utils = require('../../shared/utils');
        var seo = require('../../app/modules/seo');
        var errorPath = path.resolve('server/templates/error.html');

        return function platform(req, res, next) {
            if (_.contains(excludedUrls.all, req.path)) {
                return next();
            }
            var userAgent = utils.getUserAgent(req);
            var refererHost;
            var subdomains;

            function redirect(url, status) {
                res.set('Vary', 'User-Agent');
                res.redirect(status || 302, url);
            }

            function redirectDesktop(hasPlatform) {
                res.set('Vary', 'User-Agent');
                res.redirect(302, seo.desktopizeUrl(req.originalUrl, {
                   protocol: req.protocol,
                   host: req.headers.host,
                   path: req.path,
                   hasPlatform: hasPlatform
                }, req.query));
            }

            function checkDevice(err, response, body) {
                if (err) {
                    return fail(err);
                }
                if (!body) {
                    console.log('[OLX_DEBUG] Empty device response: ' + (response ? response.statusCode : 'no response') + ' for ' + userAgent + ' on ' + req.headers.host);
                    return fail(new Error());
                }
                req.data = req.data || {};
                req.data.device = body;
                return body;
            }

            function redirectCorrectPlatform(err, response, body) {
                var device = checkDevice(err, response, body);
                var host = req.headers.host;
                var platform;

                if (!device) {
                    return;
                }
                platform = device.web_platform || utils.defaults.platform;
                if (device.isBrowser) {
                    if (!host.indexOf('www')) {
                        return next();
                    }
                    return redirect([req.protocol, '://', host.replace(new RegExp('^m', 'i'), 'www'), req.originalUrl].join(''));
                }
                redirect([req.protocol, '://', platform, '.', host.replace(new RegExp('^www', 'i'), 'm'), req.originalUrl].join(''));
            }

            function checkCorrectPlatform(err, response, body) {
                var device = checkDevice(err, response, body);
                var host = req.headers.host;
                var platform;

                if (!device) {
                    return;
                }
                platform = device.web_platform || utils.defaults.platform;
                if (device.isBrowser) {
                    return redirectDesktop(true);
                }
                else if (platform !== req.subdomains.pop()) {
                    host = host.split('.');
                    host.shift();
                    return redirect([req.protocol, '://', platform, '.', host.join('.'), utils.removeParams(req.originalUrl, 'sid')].join(''));
                }
                next();
            }

            function checkUnknownSubdomain(err, response, body) {
                var device = checkDevice(err, response, body);
                var subdomains = req.subdomains.reverse();
                var host = req.headers.host;
                var subdomain = 'm.';
                var platform;

                if (!device) {
                    return;
                }
                platform = device.web_platform || utils.defaults.platform;
                if (device.isBrowser) {
                    subdomain = 'www.';
                }

                if (_.contains(config.get('hosts', ['olx']), subdomains[subdomains.length - 1])) {
                    subdomains = subdomains.slice(0, subdomains.length - 1);
                }
                redirect([req.protocol, '://', req.headers.host.replace(new RegExp('^' + subdomains.join('.'), 'i'), subdomain)].join(''), 301);
            }

            function fail(err) {
                statsd.increment(['Unknown Location', 'middleware', 'platform', 'error']);
                res.status(500).sendfile(errorPath);
            }

            // m.olx.com or www.olx.com
            if ((req.subdomains.length === 1 || (req.subdomains.length === 2 && _.contains(config.get('hosts', ['olx']), req.subdomains.shift()))) && ('m' === req.subdomains.pop() ||  'www' === req.subdomains.pop())) {
                dataAdapter.get(req, '/devices/' + encodeURIComponent(userAgent), redirectCorrectPlatform);
            }
            // platform.olx.com 
            else if (req.subdomains.length <= 3 && _.contains(config.get('platforms', []), req.subdomains.pop())) {
                if (!~userAgent.indexOf('Googlebot')) {
                    if (!req.headers.referer) {
                        return dataAdapter.get(req, '/devices/' + encodeURIComponent(userAgent), checkCorrectPlatform);
                    }
                    else {
                        refererHost = URLParser.parse(req.headers.referer).hostname;

                        if (refererHost !== req.headers.host.split(':').shift()) {
                            refererHost = (refererHost || '').split('.');

                            if (!_.intersection(config.get('hosts', ['olx']), refererHost).length) {
                                return dataAdapter.get(req, '/devices/' + encodeURIComponent(userAgent), checkCorrectPlatform);
                            }
                        }
                    }
                }
                next();
            }
            // location.olx.com or olx.com
            else {
                return dataAdapter.get(req, '/devices/' + encodeURIComponent(userAgent), checkUnknownSubdomain);
            }
        };

    };

};
