'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var config = require('../config').get('sixpack', {});
        var sixpack = require('sixpack-client');
        var uuid = require('node-uuid');
        var asynquence = require('asynquence');
        var _ = require('underscore');

        return function middleware(req, res, next) {
            if (_.contains(excludedUrls.all, req.path) || _.contains(excludedUrls.data, req.path) || !config.enabled || !config.experiments || !Object.keys(config.experiments)) {
                return next();
            }

            var clientId = req.rendrApp.session.get('clientId') || uuid.v4();
            var session = new sixpack.Session(clientId, config.url, req.ip, req.get('user-agent'));
            var gate = [];
            var sixpackData = {};

            for (var experiment in config.experiments) {
                closure(experiment);
            }

            asynquence().or(done)
                .gate.apply(null, gate)
                .val(done);

            function closure(experiment) {
                if (!config.experiments[experiment].enabled) {
                    return;
                }
                gate.push(then);

                function then(done) {
                    session.participate(experiment, config.experiments[experiment].alternatives, callback);

                    function callback(err, res) {
                        if (!err && res.status !== 'failed') {
                            sixpackData[experiment] = res.alternative.name;
                        }
                        done();
                    }
                }

            }

            function done() {
                req.rendrApp.session.update({
                    sixpack: sixpackData
                });
                req.rendrApp.session.persist({
                    clientId: clientId
                });
                next();
            }
        };

    };

};
