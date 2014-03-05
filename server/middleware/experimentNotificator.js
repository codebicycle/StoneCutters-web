'use strict';

var _ = require('underscore');
var sixpack = require('../../app/lib/sixpack');

/**
 * Experiment Notificator middleware.
 * Here we call sixpack server in order to tell it that a convertion has to be made.
 */
module.exports = function experimentNotificator() {

    return function experimentNotificatorLoader(dataAdapter) {

        var myClientId = sixpack.generate_client_id();
        var session = new sixpack.Session(myClientId);

        return function experimentNotificator(req, res, next) {
            var req_path = req._parsedUrl.pathname.split('/');
            if(req_path[1] == 'experiments'){
                var experimentName = req_path[2];
                var value = req_path[3];
                var client_id = req.query.client_id;
                var url = req.query.url;

                var session = new sixpack.Session(client_id);
                console.log('Making a convertion');
                console.log(req._parsedUrl);

                session.convert(experimentName, function callback(err, res) {
                if (err) throw err;
                    console.log('Convertion logged.');
                });

                req.url=url
                req.originalUrl=url;
                delete req.query.url;
                delete req.query.client_id;
            }
            next();
        };

    };

};
