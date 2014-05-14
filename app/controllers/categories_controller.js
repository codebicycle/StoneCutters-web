'use strict';

var helpers = require('../helpers');

module.exports = {
    index: function(params, callback) {
        helpers.controllers.control(this, params, controller);

        function controller() {
            var user = this.app.getSession('user');
            var siteLocation = this.app.getSession('siteLocation');
            var categoryTree = helpers.categories.getCatTree(this.app.getSession(), params.id);

            helpers.analytics.reset();
            helpers.analytics.setPage('category');
            helpers.analytics.addParam('user', user);
            helpers.analytics.addParam('category', categoryTree.parent);
            helpers.analytics.addParam('subcategory', categoryTree.subCategory);
            helpers.seo.resetHead();
            helpers.seo.addMetatag('canonical', ['http://', siteLocation, '/', params.title, '-cat-', params.id].join(''));
            callback(null, {
                category: this.app.getSession('categories')._byId[params.id],
                analytics: helpers.analytics.generateURL(this.app.getSession())
            });
        }
    },
    show: function(params, callback) {
        helpers.controllers.control(this, params, controller);

        function controller() {
            var siteLocation = this.app.getSession('siteLocation');
            var category = helpers.categories.getCat(this.app.getSession(), params.catId);
            var slug = helpers.common.urlize(category.trName);
            var categoryTree;
            var user;

            if (slug !== params.title) {
                this.redirectTo(['/', slug, '-cat-', params.catId].join(''));
                return;
            }
            categoryTree = helpers.categories.getCatTree(this.app.getSession(), params.catId);
            user = this.app.getSession('user');

            helpers.analytics.reset();
            helpers.analytics.setPage('category');
            helpers.analytics.addParam('user', user);
            helpers.analytics.addParam('category', categoryTree.parent);
            helpers.analytics.addParam('subcategory', categoryTree.subCategory);

            helpers.seo.resetHead();
            helpers.seo.addMetatag('title', 'Listing');
            helpers.seo.addMetatag('Description', 'This is a listing page');
            helpers.seo.addMetatag('canonical', ['http://', siteLocation, '/', params.title, '-cat-', params.catId].join(''));
            params.id = params.catId;
            delete params.catId;
            delete params.title;
            callback(null, {
                category: category,
                analytics: helpers.analytics.generateURL(this.app.getSession())
            });
        }
    }
};
