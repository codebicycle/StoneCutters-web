'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var _ = require('underscore');
        var config = require('../config');
        var platforms = config.get('platforms', []);
        var testing = config.get(['publicEnvironments', 'testing'], {});
        var staging = config.get(['publicEnvironments', 'staging'], {});

        function getM(subdomains) {
            var m = subdomains.indexOf('m');

            if (!~m) {
                m = subdomains.indexOf(testing.host || 'm-testing');
                if (!~m) {
                    m = subdomains.indexOf(staging.host || 'm-staging');
                }
            }
            return m;
        }

        return function middleware(req, res, next) {
            var fullHost = req.headers.host;
            var hasPort = !!~fullHost.split('.').pop().indexOf(':');
            var host = req.host;
            var subdomains = req.host.split('.');
            var com = subdomains.indexOf('com');
            var hasCom = com !== -1;
            var co = subdomains.indexOf('co');
            var hasCo = (!hasCom && co !== -1);
            var isTesting = _.contains(subdomains, 'm-testing');
            var isStaging = _.contains(subdomains, 'm-staging');
            var m = getM(subdomains);
            var hasM = m !== -1;
            var www = subdomains.indexOf('www');
            var hasWww = www !== -1;
            var domain = hasCom || hasCo ? subdomains[(hasCo ? co : com) - 1] : subdomains[subdomains.length - 2];
            var siteLocation = [];
            var domainLocation = [];
            var locationUrl = ['www'];
            var platform;
            var country;
            var location;
            var port;
            var fullDomain;

            if (!hasM) {
                platform = 'desktop';
            }
            else if (_.contains(platforms, subdomains[0])) {
                platform = subdomains[0];
            }
            if (hasM && !_.contains(subdomains, 'm')) {
                if (isTesting) {
                    country = testing.mask;
                }
                else {
                    country = staging.mask;
                }
            }
            else if (com !== subdomains.length - 1) {
                country = subdomains[subdomains.length -1];
            }
            if (!hasM && !hasWww) {
                location = subdomains[0];
            }
            if (location) {
                siteLocation.push(location);
            }
            else {
                siteLocation.push('www');
            }
            siteLocation.push(domain);
            domainLocation.push(domain);
            locationUrl.push(domain);
            if (hasCom) {
                siteLocation.push('com');
                domainLocation.push('com');
                locationUrl.push('com');
            }
            if (hasCo) {
                siteLocation.push('co');
                domainLocation.push('co');
                locationUrl.push('co');
            }
            if (country) {
                siteLocation.push(country);
                domainLocation.push(country);
                locationUrl.push(country);
            }
            siteLocation = siteLocation.join('.');
            domainLocation = domainLocation.join('.');
            locationUrl = locationUrl.join('.');
            fullDomain = domainLocation;
            if (hasPort) {
                port = fullHost.split(':').pop();
                fullDomain = fullDomain + ':' + port;
            }
            req.rendrApp.set('session', {
                shortHost: host,
                host: fullHost,
                platform: req.cookies && req.cookies.forcedPlatform ? req.cookies.forcedPlatform : platform,
                port: port,
                locationUrl: locationUrl,
                domain: domainLocation,
                fullDomain: fullDomain
            });
            if (!hasM || isTesting || isStaging) {
                req.rendrApp.get('session').siteLocation = siteLocation;
            }
            next();
        };
    };
};
