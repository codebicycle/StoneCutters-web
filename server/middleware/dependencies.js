'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var _ = require('underscore');
        var path = require('path');
        var asynquence = require('asynquence');
        var statsd  = require('../modules/statsd')();
        var errorPath = path.resolve('server/templates/error.html');

        return function middleware(req, res, next) {
            if (_.contains(excludedUrls.all, req.path)) {
                return next();
            }

            function fetch(done) {
                req.rendrApp.fetchDependencies(['categories', 'countries', 'states', 'topCities'], false, done);
            }

            function store(done, response) {
                res.locals(response.toJSON());
                done();
            }

            function fail(err) {
                console.log('[OLX_DEBUG]', 'dependencies', err, req.rendrApp.session.get('selectedLanguage'), req.host, req.originalUrl);
                statsd.increment([req.rendrApp.session.get('location').abbreviation, 'middleware', 'dependencies', 'error']);
                res.status(500).sendfile(errorPath);
            }

            asynquence().or(fail)
                .then(fetch)
                .then(store)
                .val(next);
        };

    };

};
