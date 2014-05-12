'use strict';

var helpers = require('../helpers');

module.exports = {
    index: function(params, callback) {
        var app = helpers.environment.init(this.app);
        var session = app.getSession();
        var user = app.getSession('user');
        var category = helpers.categories.getCat(session, params.id);
        var categoryTree = helpers.categories.getCatTree(session, params.id);

        helpers.analytics.reset();
        helpers.analytics.setPage('/description-cat-' + category.id + '-p-1');
        helpers.analytics.addParam('user', user);
        helpers.analytics.addParam('category', categoryTree.parent);
        helpers.analytics.addParam('subcategory', categoryTree.subCategory);

        callback(null, {
            category: category,
            params: params,
            template: app.getSession('template'),
            analytics: helpers.analytics.generateURL(session)
        });
    },
    show: function(params, callback) {
        var app = helpers.environment.init(this.app);
        var session = app.getSession();
        var user = app.getSession('user');
        var category;
        var categoryTree;

        helpers.seo.resetHead();
        helpers.seo.addMetatag('title', 'Listing');
        helpers.seo.addMetatag('Description', 'This is a listing page');

        params.id = params.catId;
        delete params.catId;
        delete params.title;

        category = helpers.categories.getCat(session, params.id);
        categoryTree = helpers.categories.getCatTree(session, params.id);

        helpers.analytics.reset();
        helpers.analytics.setPage('/description-cat-' + category.id + '-p-1');
        helpers.analytics.addParam('user', user);
        helpers.analytics.addParam('category', categoryTree.parent);
        helpers.analytics.addParam('subcategory', categoryTree.subCategory);

        callback(null, {
            category: category,
            params: params,
            location: app.getSession('location'),
            template: app.getSession('template'),
            analytics: helpers.analytics.generateURL(session)
        });
    }
};
