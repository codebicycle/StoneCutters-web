'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var _ = require('underscore');
        var config = require('../config');
        var platforms = config.get('platforms', []);
        var testing = config.get(['publicEnvironments', 'testing'], {});
        var staging = config.get(['publicEnvironments', 'staging'], {});

        return function middleware(req, res, next) {
            var fullHost = req.headers.host;
            var hasPort = !!~fullHost.split('.').pop().indexOf(':');
            var host = req.host;
            var subdomains = req.host.split('.');
            var com = subdomains.indexOf('com');
            var hasCom = (com !== -1);
            var co = subdomains.indexOf('co');
            var hasCo = (co !== -1);
            var isTesting = _.contains(subdomains, 'm-testing');
            var isStaging = _.contains(subdomains, 'm-staging');
            var m = subdomains.indexOf('m') || subdomains.indexOf(testing.host || 'm-testing') || subdomains.indexOf(staging.host || 'm-staging');
            var hasM = m !== -1;
            var www = subdomains.indexOf('www');
            var hasWww = www !== -1;
            var domain = hasCom || hasCo ? subdomains[(hasCo ? co : com) - 1] : subdomains[subdomains.length - 2];
            var siteLocation = [];
            var platform;
            var country;
            var location;
            var port;

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
            if (hasCom) {
                siteLocation.push('com');
            }
            if (hasCo) {
                siteLocation.push('co');
            }
            if (country) {
                siteLocation.push(country);
            }
            siteLocation = siteLocation.join('.');
            if (hasPort) {
                port = fullHost.split(':').pop();
            }

            req.rendrApp.session.update({
                shortHost: host,
                host: fullHost,
                previousLocation: isTesting || isStaging ? siteLocation : req.rendrApp.session.get('siteLocation'),
                siteLocation: siteLocation,
                platform: platform
            });
            next();
        };
    };
};
