'use strict';

module.exports = function(dataAdapter) {

    return function loader() {
        var asynquence = require('asynquence');

        return function middleware(req, res, next) {
            var app = req.rendrApp;
            var siteLocation = app.getSession('siteLocation');

            function fetch(done) {
                var api = {
                    body: {},
                    url: '/countries/' + siteLocation + '/categories'
                };

                function success(results) {
                    var categories = {
                        models: results,
                        _byId: {}
                    };

                    categories.models.forEach(function processCategory(category) {
                        categories._byId[category.id] = category;
                    });

                    done(categories);
                }

                dataAdapter.promiseRequest(req, api, success, done.fail);
            }

            function store(done, categories) {
                app.updateSession({
                    categories: categories
                });
                done();
            }

            function fail(msg) {
                console.log('Failure: ' + msg);
                res.send(400, msg);
            }

            if (!app.getSession('updateRequired')) {
                return next();
            }

            asynquence().or(fail)
                .then(fetch)
                .then(store)
                .val(next);
        };

    };

};
