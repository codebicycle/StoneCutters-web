'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var _ = require('underscore');
        var path = require('path');
        var asynquence = require('asynquence');
        var config = require('../config');
        var statsd  = require('../modules/statsd')();
        var errorPath = path.resolve('server/templates/error.html');

        return function middleware(req, res, next) {
            if (_.contains(excludedUrls.all, req.path)) {
                return next();
            }
    
            function fetch(done) {
                req.rendrApp.fetch({
                    countries: {
                        collection: 'Countries'
                    }
                }, {
                    readFromCache: false
                }, done.errfcb);
            }

            function store(done, response) {
                req.rendrApp.session.update({
                    countries: response.countries
                });
                res.locals({
                    countries: response.countries.toJSON()
                });
                done();
            }

            function fail(err) {
                statsd.increment(['Unknown Category', 'middleware', 'countries', 'error']);
                res.status(500).sendfile(errorPath);
            }

            asynquence().or(fail)
                .then(fetch)
                .then(store)
                .val(next);
        };

    };

};
