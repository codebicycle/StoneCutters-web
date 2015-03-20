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
            var query = {};
            var parts;

            if (!from) {
                return next();
            }
            if (utils.startsWith(host, from)) {
                host = 'www.' + host;
            }
            host = host.replace(from, schibsted[from].to);
            parts = req.path.split('/').slice(1);
            if (!utils.startsWith(host, 'm.')) {
                if (parseRegion(parts[0])) {
                    parts = parts.slice(1);
                }
                if (parseArea(parts[0])) {
                    parts = parts.slice(1);
                }
                if (parseCategory(parts[0])) {
                    parts = parts.slice(1);
                }
            }
            else {
                _.each(req.originalUrl.split('?').pop().split('&'), function each(param) {
                    param = param.split('=');
                    query[param[0]] = param[1];
                });
                parseRegion(query.ca, true);
                parseArea(query.m, true);
                parseCategory(query.cg, true);
            }

            function parseRegion(region, isM) {
                var id;
                var to;

                if (!region) {
                    return;
                }
                region = decodeURIComponent(region).split('-').shift();
                id = isM ? schibsted[from].regionsIds[region] : region;
                to = schibsted[from].regions[id];
                if (!to) {
                    return;
                }
                host = host.replace(host.split('.').shift(), to);
                return true;
            }

            function parseArea(area, isM) {
                var id;
                var to;

                if (!area) {
                    return;
                }
                area = decodeURIComponent(area).split('-').shift();
                id = isM ? schibsted[from].areasIds[area] : area;
                to = schibsted[from].areas[id];
                if (!to) {
                    return;
                }
                host = host.replace(host.split('.').shift(), to);
                return true;
            }

            function parseCategory(category, isM) {
                var id;
                var to;

                if (!category) {
                    return;
                }
                category = decodeURIComponent(category).split('-').shift();
                id = isM ? schibsted[from].categoriesIds[category] : category;
                to = schibsted[from].categories[id];
                if (!to) {
                    url = '/nf/all-results';
                    return true;
                }
                url = '/' + to;
                return true;
            }

            url = 'http://' + host + url;
            url = utils.params(url, 'from', 'schibsted');
            return res.redirect(301, url);
        };

    };

};
