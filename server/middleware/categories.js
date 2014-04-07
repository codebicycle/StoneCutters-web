'use strict';

module.exports = function(dataAdapter) {

    return function loader() {
        var asynquence = require('asynquence');
        var debug = require('debug')('arwen:middleware:categories');

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

            function getChildren(done, categories) {
                var children = {};

                function traverseCategories(category) {
                    category.children.forEach(traverseChildCategories);
                }

                function traverseChildCategories(subCategory, index, categories) {
                    children[subCategory.id] = subCategory;
                }

                categories.models.forEach(traverseCategories);
                done(categories, children);
            }

            function store(done, categories, children) {
                app.updateSession({
                    categories: categories,
                    childCategories: children,
                });
                done();
            }

            function fail(err) {
                debug('%s %j', 'ERROR', err);
                res.send(400, err);
            }

            asynquence().or(fail)
                .then(fetch)
                .then(getChildren)
                .then(store)
                .val(next);
        };

    };

};
