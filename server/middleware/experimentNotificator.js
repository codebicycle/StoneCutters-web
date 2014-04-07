'use strict';

/**
 * Experiment Notificator middleware.
 * Here we call sixpack server in order to tell it that a convertion has to be made.
 */
module.exports = function(dataAdapter) {

    return function loader() {
        var _ = require('underscore');
        var sixpack = require('../../app/lib/sixpack');
        var myClientId = sixpack.generate_client_id();
        var session = new sixpack.Session(myClientId);

        return function middleware(req, res, next) {
            var req_path = req._parsedUrl.pathname.split('/');

            if (req_path[1] == 'experiments') {
                var experimentName = req_path[2];
                var value = req_path[3];
                var client_id = req.query.client_id;
                var url = req.query.url;

                var session = new sixpack.Session(client_id);

                session.convert(experimentName, function callback(err, res) {
                    if (err) throw err;
                });

                req.url = url;
                req.originalUrl = url;
                delete req.query.url;
                delete req.query.client_id;
            }
            next();
        };

    };

};
