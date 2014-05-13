'use strict';

/**
 * AB Testing middleware.
 * Here we call sixpack server in order to define which template we have to show.
 */
module.exports = function(dataAdapter) {

    return function loader() {
        var config = require('../config').get('sixpack', {});
        var sixpack = require('sixpack-client');
        var uuid = require('node-uuid');
        var asynquence = require('asynquence');

        return function middleware(req, res, next) {
            if (!config.enabled || !config.experiments || !Object.keys(config.experiments)) {
                return next();
            }

            var clientId = req.rendrApp.getSession('clientId') || uuid.v4();
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
                req.rendrApp.updateSession({
                    sixpack: sixpackData
                });
                req.rendrApp.persistSession({
                    clientId: clientId
                });
                next();
            }
        };

    };

};
