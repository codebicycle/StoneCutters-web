'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var _ = require('underscore');
        var configServer = require('../config');
        var configClient = require('../../shared/config');
        var utils = require('../../shared/utils');

        return function middleware(req, res, next) {
            if (_.contains(excludedUrls.all, req.path)) {
                return next();
            }

            var platform = req.rendrApp.session.get('forcedPlatform') || req.subdomains.pop() || utils.defaults.platform;
            var location = req.rendrApp.session.get('location');
            var directory = 'default';
            var minify = configServer.get(['uglify', 'enabled'], true);
            var localization = configClient.get('localization', {});
            var jsDir = '/js/' + (minify ? 'min' : 'src');
            var template;

            if (!!(localization[platform] && ~localization[platform].indexOf(location.url))) {
                directory = location.url;
            }
            template = directory + '/' + platform;

            req.rendrApp.session.update({
                directory: directory,
                template: template,
                jsDir: jsDir
            });
            req.rendrApp.req.app.locals({
                directory: directory,
                template: template,
                jsDir: jsDir
            });
            next();
        };
    };
};
