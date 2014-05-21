'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var build = require('../../app/config').get('deploy', false);
        var _ = require('underscore');

        return function environment(req, res, next) {
            if (_.contains(excludedUrls.all, req.path) || _.contains(excludedUrls.data, req.path)) {
                return next();
            }

            var bar = {
                show: false
            };

            if (build) {
                bar.version = build.version;
                bar.revision = build.revision;
                bar.show = true;
                bar.env = (process.env.NODE_ENV || 'DEV').toUpperCase();
                bar.platform = req.rendrApp.getSession('platform').toUpperCase();
            }
            req.rendrApp.updateSession({
                blackBar: bar
            });
            req.rendrApp.req.app.locals({
                blackBar: bar
            });
            next();
        };

    };

};
