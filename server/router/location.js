 'use strict';

module.exports = function(app, dataAdapter) {
    var asynquence = require('asynquence');
    var utils = require('../../shared/utils');

    (function location() {
        app.get('/nf/location/redirect', handler);

        function handler(req, res, next) {
            function check(done) {
                var location = req.param('relocation');

                if (!location) {
                    return done.fail();
                }
                done(location);
            }

            function persist(done, location) {
                req.rendrApp.session.persist({
                    siteLocation: location
                });
                done();
            }

            function success() {
                res.redirect(utils.link(req.param('target', '/'), req.rendrApp));
            }

            function fail(err) {
                var url = req.headers.referer || '/';

                res.redirect(utils.link(url.split('?').shift(), req.rendrApp));
            }

            asynquence().or(fail)
                .then(check)
                .then(persist)
                .val(success);
        }
    })();

};
