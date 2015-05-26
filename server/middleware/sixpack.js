'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var _ = require('underscore');
        var utils = require('../../shared/utils');
        var Sixpack = require('../../shared/sixpack');

        return function middleware(req, res, next) {
            if (_.contains(excludedUrls.all, req.path) || !Sixpack.enabled) {
                return next();
            }

            var sixpack = new Sixpack({
                clientId: req.rendrApp.session.get('clientId'),
                ip: req.rendrApp.session.get('ip'),
                userAgent: req.rendrApp.session.get('userAgent'),
                platform: req.rendrApp.session.get('platform'),
                market: req.rendrApp.session.get('location').abbreviation
            });

            _.each(sixpack.experiments, function each(experiment) {
                var force = req.param('sixpack-force-' + experiment.name);

                if (force) {
                    experiment.force = force;
                }
            });
            sixpack.participateAll(callback);

            function callback(err) {
                if (err) {
                    return next();
                }
                req.rendrApp.session.update({
                    experiments: sixpack.experiments
                });
                res.locals({
                    experiments: sixpack.experiments
                });
                next();
            }
        };

    };

};
