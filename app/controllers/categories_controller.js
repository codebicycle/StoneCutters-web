'use strict';

var helpers = require('../helpers');

module.exports = {
    show: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var siteLocation = this.app.getSession('siteLocation');
            var category = helpers.categories.getCat(this.app.getSession(), params.catId);
            var categoryTree;
            var user;
            var slug;

            if (!category) {
                this.redirectTo(helpers.common.link('/', siteLocation), {
                    status: 301
                });
                return;
            }
            slug = helpers.common.slugToUrl(category);
            if (slug.indexOf(params.title + '-cat-')) {
                this.redirectTo(helpers.common.link('/' + slug, siteLocation), {
                    status: 301
                });
                return;
            }
            categoryTree = helpers.categories.getCatTree(this.app.getSession(), params.catId);
            user = this.app.getSession('user');

            helpers.analytics.reset();
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
