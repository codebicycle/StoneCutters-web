'use strict';

module.exports = function(dataAdapter, excludedUrls) {
    return function loader() {
        var _ = require('underscore');
        var asynquence = require('asynquence');
        var statsd = require('../modules/statsd')();
        var comCountries = ['tn', 'us', 'nl', 'vn', 'mc', 'dz'];

        function endsWith(str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        }

        return function middleware(req, res, next) {
            if (_.contains(excludedUrls.all, req.path)) {
                return next();
            }

            var edgescape = req.get('x-akamai-edgescape');
            var countryCode;

            if (!edgescape || req.path !== '/' || !endsWith(req.host, '.com')) {
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

            countryCode = countryCode.toLowerCase();

            if (_.contains(comCountries, countryCode)) {
                return next();
            }
            else {
                if (countryCode === 'th') {
                    return (function thailand() {
                        res.redirect(setUrl('www.olx.co.th'));
                    })();
                }
                else if (countryCode === 'pt') {
                    return (function portugal() {
                        res.redirect(setUrl('www.olx.pt'));
                    })();
                }
                else if (countryCode === 've') {
                    countryCode = 'vz';
                }
            }

            asynquence().or(error)
                .then(fetch)
                .val(redirect);

            function fetch(done) {
                dataAdapter.get(req, '/countries/' + countryCode, {
                    store: true
                }, done.errfcb);
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

            function setUrl(url) {
                var origin = req.get('host').split(':');
                var host = req.protocol + '://' + url;

                if (origin.length > 1) {
                    host += ':' + origin[1];
                }
                return host + req.originalUrl;
            }

            function error(err) {
                next();
            }
        };
    };
};
