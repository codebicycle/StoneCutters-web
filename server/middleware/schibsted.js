'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var _ = require('underscore');
        var utils = require('../../shared/utils');
        var schibsted = require('../../shared/config').get('schibsted', {});

        return function middleware(req, res, next) {
            var from = _.find(Object.keys(schibsted), function each(from) {
                return req.host && ~req.host.indexOf(from);
            });
            var host = req.headers.host;
            var url = '/';
            var query;
            var parts;

            if (!from) {
                return next();
            }
            host = host.replace(from, schibsted[from].to);
            parts = req.path.split('/').slice(1);

            (function parseRegion() {
                var region = parts[0];

                if (!region) {
                    return;
                }
                region = decodeURIComponent(region).split('-').shift();
                if (!schibsted[from].regions[region]) {
                    return;
                }
                host = host.replace(host.split('.').shift(), schibsted[from].regions[region]);
                parts = parts.slice(1);
            })();

            (function parseArea() {
                var area = parts[0];

                if (!area) {
                    return;
                }
                area = decodeURIComponent(area).split('-').shift();
                if (!schibsted[from].areas[area]) {
                    return;
                }
                host = host.replace(host.split('.').shift(), schibsted[from].areas[area]);
                parts = parts.slice(1);
            })();

            (function parseCategory() {
                var category = parts[0];

                if (!category) {
                    return;
                }
                category = decodeURIComponent(category).split('-').shift();
                if (!schibsted[from].categories[category]) {
                    url = '/nf/all-results';
                    return;
                }
                url = '/' + schibsted[from].categories[category];
                parts = parts.slice(1);
            })();

            url = 'http://' + host.replace(from, schibsted[from].to) + url;
            url = utils.params(url, 'from', 'schibsted');
            return res.redirect(301, url);
        };

    };

};
