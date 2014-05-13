'use strict';

var helpers = require('../helpers');

module.exports = {
    index: function(params, callback) {
        helpers.controllers.control(this, params, controller);

        function controller() {
            var user = this.app.getSession('user');
            var categoryTree = helpers.categories.getCatTree(this.app.getSession(), params.id);

            helpers.analytics.reset();
            helpers.analytics.setPage('/description-cat-' + params.id + '-p-1');
            helpers.analytics.addParam('user', user);
            helpers.analytics.addParam('category', categoryTree.parent);
            helpers.analytics.addParam('subcategory', categoryTree.subCategory);
            callback(null, {
                category: this.app.getSession('categories')._byId[params.id],
                analytics: helpers.analytics.generateURL(this.app.getSession())
            });
        }
    },
    show: function(params, callback) {
        helpers.controllers.control(this, params, controller);

        function controller() {
            var user = this.app.getSession('user');
            var categoryTree = helpers.categories.getCatTree(this.app.getSession(), params.catId);

            helpers.analytics.reset();
            helpers.analytics.setPage('/description-cat-' + params.catId + '-p-1');
            helpers.analytics.addParam('user', user);
            helpers.analytics.addParam('category', categoryTree.parent);
            helpers.analytics.addParam('subcategory', categoryTree.subCategory);

            helpers.seo.resetHead();
            helpers.seo.addMetatag('title', 'Listing');
            helpers.seo.addMetatag('Description', 'This is a listing page');
            params.id = params.catId;
            delete params.catId;
            delete params.title;
            callback(null, {
                category: this.app.getSession('categories')._byId[params.id],
                analytics: helpers.analytics.generateURL(this.app.getSession())
            });
        }
    }
};
