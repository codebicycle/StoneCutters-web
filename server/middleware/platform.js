'use strict';

var _ = require('underscore');
var URLParser = require('url');
var config = require('../config');
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

            function callback(err, response, body) {
                var platform;

                if (err) {
                    return fail(err);
                }
                if (!body) {
                    console.log('[OLX_DEBUG] Empty device response: ' + (response ? response.statusCode : 'no response') + ' for ' + userAgent + ' on ' + req.headers.host);
                    return fail(new Error());
                }
                platform = body.web_platform || 'wap';
                res.set('Vary', 'User-Agent');
                res.redirect(302, req.protocol + '://' + platform + '.' + req.headers.host + req.originalUrl);
            }

            function check(err, response, body) {
                var host = req.headers.host;
                var platform;

                if (err) {
                    return fail(err);
                }
                if (!body) {
                    console.log('[OLX_DEBUG] Empty device response: ' + (response ? response.statusCode : 'no response') + ' for ' + userAgent + ' on ' + req.headers.host);
                    return fail(new Error());
                }
                platform = body.web_platform || 'wap';

                if (platform !== req.subdomains.pop()) {
                    host = host.split('.');
                    host.shift();
                    res.set('Vary', 'User-Agent');
                    return res.redirect(302, [req.protocol, '://', platform, '.', host.join('.'), utils.removeParams(req.originalUrl, 'sid')].join(''));
                }
                next();
            }

            function fail(err) {
                graphite.send(['Unknown Location', 'middleware', 'platform', 'error'], 1, '+');
                res.status(500).sendfile(errorPath);
            }

            if ((req.subdomains.length === 1 || (req.subdomains.length === 2 && _.contains(config.get('hosts', ['olx']), req.subdomains.shift()))) && 'm' === req.subdomains.pop()) {
                dataAdapter.get(req, '/devices/' + encodeURIComponent(userAgent), callback);
            }
            else if (req.subdomains.length <= 3 && _.contains(config.get('platforms', []), req.subdomains.pop())) {
                if (!~userAgent.indexOf('Googlebot')) {
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
