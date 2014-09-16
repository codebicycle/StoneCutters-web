'use strict';

module.exports = function(dataAdapter, excludedUrls) {
    return function loader() {
        var _ = require('underscore');
        var asynquence = require('asynquence');
        var statsd = require('../modules/statsd')();
        var comCountries = ['tn', 'TN', 'us', 'US', 'nl', 'NL', 'vn', 'VN', 'mc', 'MC', 'dz', 'DZ'];

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
            else if (_.contains(comCountries, countryCode)) {
                return next();
            }
            else if (countryCode === 'TH' || countryCode === 'th') {
                return (function thailand() {
                    var origin = req.get('host').split(':');
                    var host = req.protocol + '://www.olx.co.th';

                    if (origin.length > 1) {
                        host += ':' + origin[1];
                    }
                    res.redirect(host + req.originalUrl);
                })();
            }
            else if (countryCode === 'VE' || countryCode === 've') {
                countryCode = 'VZ';
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
                statsd.increment([country.name, 'middleware', 'com', 'redirection']);
                res.header('Cache-Control', 'no-cache, no-store');
                res.redirect(host + req.originalUrl);
            }

            function error(err) {
                console.log('[OLX_DEBUG]', 'com', edgescape, err);
                statsd.increment(['Unknown Location', 'middleware', 'com', 'error']);
                next();
            }
        };
    };
};
