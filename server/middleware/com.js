'use strict';

module.exports = function(dataAdapter, excludedUrls) {
    return function loader() {
        var path = require('path');
        var _ = require('underscore');
        var asynquence = require('asynquence');
        var statsd = require('../modules/statsd')();
        var errorPath = path.resolve('server/templates/error.html');

        function endsWith(str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        }

        return function middleware(req, res, next) {
            if (_.contains(excludedUrls.all, req.path)) {
                return next();
            }

            var edgescape = req.get('x-akamai-edgescape');
            var countryCode;

            if (!edgescape || !endsWith(req.host, '.com')) {
                return next();
            }
            edgescape.split(',').forEach(function each(property) {
                property = property.split('=');
                if (property[0] === 'country_code') {
                    countryCode = property[1];
                }
            });
            if (!countryCode) {
                statsd.increment(['Unknown Location', 'middleware', 'com', 'miss']);
                return next();
            }
            asynquence().or(error)
                .then(fetch)
                .val(redirect);

            function fetch(done) {
                dataAdapter.get(req, '/countries/' + countryCode, done.errfcb);
            }

            function redirect(response, country) {
                var origin = req.get('host').split(':');
                var host = req.protocol + '://' + country.url.replace('www', 'm');

                if (origin.length > 1) {
                    host += ':' + origin[1];
                }
                console.log('[OLX_DEBUG]', 'redirection', 'from', req.protocol + '://' + req.get('host') + req.originalUrl, 'to', host + req.originalUrl);
                console.log('[OLX_DEBUG]', 'edgescape', edgescape);
                statsd.increment([country.name, 'middleware', 'com', 'redirection']);
                res.redirect(host + req.originalUrl);
            }

            function error(err) {
                statsd.increment(['Unknown Location', 'middleware', 'com', 'error']);
                res.status(500).sendfile(errorPath);
            }
        };
    };
};
