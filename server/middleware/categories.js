'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var asynquence = require('asynquence');

        return function middleware(req, res, next) {
            if (~excludedUrls.indexOf(req.path)) {
                return next();
            }

            var app = req.rendrApp;
            var siteLocation = app.getSession('siteLocation');
            var categories;
            var children;

            function fetch(done) {
                dataAdapter.get(req, '/countries/' + siteLocation + '/categories', done.errfcb);
            }

            function parse(done, response, _categories) {
                categories = {
                    models: _categories,
                    _byId: {}
                };

                categories.models.forEach(function each(category) {
                    categories._byId[category.id] = category;
                });
                done();
            }

            function getChildren(done) {
                children = {};

                function traverseCategories(category) {
                    category.children.forEach(traverseChildCategories);
                }

                function traverseChildCategories(subCategory, index) {
                    children[subCategory.id] = subCategory;
                }

                categories.models.forEach(traverseCategories);
                done();
            }

            function store(done) {
                app.updateSession({
                    categories: categories,
                    childCategories: children,
                });
                done();
            }

            function fail(err) {
                res.send(400, err);
            }

            asynquence().or(fail)
                .then(fetch)
                .then(parse)
                .then(getChildren)
                .then(store)
                .val(next);
        };

    };

};
