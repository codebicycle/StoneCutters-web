'use strict';

module.exports = function(dataAdapter) {

    return function loader() {
        var _ = require('underscore');
        var path = require('path');
        var asynquence = require('asynquence');
        var config = require('../config');
        var statsd  = require('../modules/statsd')();
        var utils = require('../../shared/utils');
        var Seo = require('../../app/modules/seo');
        var errorPath = path.resolve('server/templates/error.html');
        var testing = config.get(['publicEnvironments', 'testing'], {});
        var staging = config.get(['publicEnvironments', 'staging'], {});

        return function middleware(req, res, next) {
            var seo = Seo.instance(req.rendrApp);

            function fetch(done) {
                req.rendrApp.fetch({
                    categories: {
                        collection: 'Categories',
                        params: {
                            location: req.rendrApp.session.get('siteLocation'),
                            languageCode: req.rendrApp.session.get('selectedLanguage'),
                            seo: seo.isEnabled()
                        }
                    }
                }, {
                    readFromCache: false
                }, done.errfcb);
            }

            function store(done, response) {

                req.rendrApp.session.update({
                    categories: response.categories
                });

                res.locals({
                    categories: response.categories.toJSON()
                });

                done();
            }

            function fail(err) {
                console.log(err);
                statsd.increment(['Unknown Category', 'middleware', 'categories', 'error']);
                res.status(500).sendfile(errorPath);
            }

            asynquence().or(fail)
                .then(fetch)
                .then(store)
                .val(next);
        };

    };

};
