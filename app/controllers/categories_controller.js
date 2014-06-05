'use strict';

var helpers = require('../helpers');
var _ = require('underscore');

function handleItems(params, callback) {
    var app = this.app;
    var spec = {
        items: {
            collection: 'Items',
            params: params
        }
    };
    var siteLocation = app.getSession('siteLocation');
    var category = helpers.categories.getCat(app.getSession(), params.catId);
    var query;
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

    helpers.pagination.prepare(app, params);
    query = _.clone(params);
    params.categoryId = params.catId;
    delete params.catId;
    delete params.title;
    delete params.page;
    delete params.filters;
    delete params.urlFilters;

    helpers.seo.resetHead();
    helpers.seo.addMetatag('canonical', ['http://', siteLocation, '/', slug, (query.page && query.page > 1 ? '-p-' + query.page : '')].join(''));

    /** don't read from cache, because rendr caching expects an array response
    with ids, and smaug returns an object with 'data' and 'metadata' */
    app.fetch(spec, {
        'readFromCache': false
    }, function afterFetch(err, result) {
        var protocol = app.getSession('protocol');
        var host = app.getSession('host');
        var url = (protocol + '://' + host + '/' + query.title + '-cat-' + query.catId);
        var model = result.items.models[0];
        var category = helpers.categories.getCat(app.getSession(), query.catId);
        var categoryTree = helpers.categories.getCatTree(app.getSession(), query.catId);

        result.items = model.get('data');
        result.metadata = model.get('metadata');

        helpers.pagination.paginate(result.metadata, query, url);
        helpers.analytics.reset();
        helpers.analytics.setPage('listing');
        helpers.analytics.addParam('category', categoryTree.parent);
        helpers.analytics.addParam('subcategory', categoryTree.subCategory);
        console.log(categoryTree);
        result.analytics = helpers.analytics.generateURL(app.getSession());
        result.category = category;
        result.type = 'items';
        callback(err, result);
    });
}

function handleShow(params, callback) {
    var siteLocation = this.app.getSession('siteLocation');
    var category = helpers.categories.getCat(this.app.getSession(), params.catId);
    var categoryTree;
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
    
    helpers.analytics.reset();
    helpers.analytics.addParam('user', this.app.getSession('user'));
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
        type: 'categories',
        analytics: helpers.analytics.generateURL(this.app.getSession())
    });
}

module.exports = {
    show: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var category = helpers.categories.getCat(this.app.getSession(), params.catId);
            
            if (category.parentId) {
                handleItems.call(this, params, callback);
                return;
            } 
            handleShow.call(this, params, callback);
        }
    }
};
