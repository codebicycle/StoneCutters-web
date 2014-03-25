'use strict';

module.exports = function(dataAdapter) {

    return function loader() {
        var asynquence = require('asynquence');

        return function middleware(req, res, next) {
            var app = req.rendrApp;
            var siteLocation = app.getSession('siteLocation');
            var cache = require('../../cache')();

            function fetch(done) {
                var key = ['categories', siteLocation];

                function notCached(done) {
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

                cache.get(key, done, notCached);
            }

            function getChildren(done, categories) {
                var key = ['categories', 'children', siteLocation];

                function notCached(done) {
                    var children = {};

                    function traverseCategories(category) {
                        category.children.forEach(traverseChildCategories);
                    }

                    function traverseChildCategories(subCategory, index, categories) {
                        children[subCategory.id] = subCategory;
                    }

                    categories.models.forEach(traverseCategories);
                    done(children);
                }

                function cached(children) {
                    done(categories, children);
                }

                cache.get(key, done, notCached, cached);
            }

            function store(done, categories, children) {
                app.updateSession({
                    categories: categories,
                    childCategories: children,
                });
                done();
            }

            function fail(msg) {
                console.log('Middleware Failure (Categories): ' + msg);
                res.send(400, msg);
            }

            asynquence().or(fail)
                .then(fetch)
                .then(getChildren)
                .then(store)
                .val(next);
        };

    };

};
