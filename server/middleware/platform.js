'use strict';

var _ = require('underscore');
var URLParser = require('url');
var config = require('../config');
var seo = require('../../app/seo');
var utils = require('../../shared/utils');

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var _ = require('underscore');
        var path = require('path');
        var errorPath = path.resolve('server/templates/error.html');
        var graphite = require('../graphite')();

        return function platform(req, res, next) {
            if (_.contains(excludedUrls.all, req.path)) {
                return next();
            }
            var userAgent = req.get('user-agent') || utils.defaults.userAgent;
            var redirectOnDesktop = config.get(['redirect', 'onDesktop'], false);
            var refererHost;
            var subdomains;

            function redirect(url, status) {
                res.set('Vary', 'User-Agent');
                res.redirect(status || 302, url);
            }

            function redirectDesktop() {
                res.set('Vary', 'User-Agent');
                res.redirect(302, seo.desktopizeUrl(req.originalUrl, {
                   protocol: req.protocol,
                   host: req.headers.host,
                   path: req.path
                }));
            }

            function checkDevice(err, response, body) {
                if (err) {
                    fail(err);
                    return;
                }
                if (!body) {
                    console.log('[OLX_DEBUG] Empty device response: ' + (response ? response.statusCode : 'no response') + ' for ' + userAgent + ' on ' + req.headers.host);
                    fail(new Error());
                    return;
                }
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
                if (redirectOnDesktop && device.isBrowser) {
                    return redirectDesktop();
                }
                redirect([req.protocol, '://', platform, '.', host, req.originalUrl].join(''));
            }

            function checkCorrectPlatform(err, response, body) {
                var device = checkDevice(err, response, body);
                var host = req.headers.host;
                var platform;

                if (!device) {
                    return;
                }
                platform = device.web_platform || utils.defaults.platform;
                if (redirectOnDesktop && device.isBrowser) {
                    return redirectDesktop();
                }
                else if (platform !== req.subdomains.pop()) {
                    host = host.split('.');
                    host.shift();
                    return redirect([req.protocol, '://', platform, '.', host.join('.'), utils.removeParams(req.originalUrl, 'sid')].join(''));
                }
                next();
            }

            function fail(err) {
                graphite.send(['Unknown Location', 'middleware', 'platform', 'error'], 1, '+');
                res.status(500).sendfile(errorPath);
            }

            if ((req.subdomains.length === 1 || (req.subdomains.length === 2 && _.contains(config.get('hosts', ['olx']), req.subdomains.shift()))) && 'm' === req.subdomains.pop()) {
                dataAdapter.get(req, '/devices/' + encodeURIComponent(userAgent), redirectCorrectPlatform);
            }
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
            else {
                subdomains = req.subdomains.reverse();

                if (_.contains(config.get('hosts', ['olx']), subdomains[subdomains.length - 1])) {
                    subdomains = subdomains.slice(0, subdomains.length - 1);
                }
                redirect([req.protocol, '://', req.headers.host.replace(new RegExp('^' + subdomains.join('.'), 'i'), 'm')].join(''), 301);
            }
        };

    };

};
