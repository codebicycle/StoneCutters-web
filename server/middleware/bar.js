'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var config = require('../../app/config');
        var build = config.get(['deploy'], false);
        var env = config.get(['environment', 'type'], 'DEV');
        var _ = require('underscore');

        return function environment(req, res, next) {
            if (_.contains(excludedUrls.all, req.path) || _.contains(excludedUrls.data, req.path)) {
                return next();
            }

            var bar = {
                show: false
            };

            if (build && env != 'production') {
                bar.version = build.version;
                bar.revision = build.revision;
                bar.show = true;
                bar.env = env.toUpperCase();
                bar.platform = req.rendrApp.session.get('platform').toUpperCase();
            }
            req.rendrApp.session.update({
                blackBar: bar
            });
            req.rendrApp.req.app.locals({
                blackBar: bar
            });
            next();
        };

    };

};
