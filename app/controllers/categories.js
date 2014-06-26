'use strict';

var helpers = require('../helpers');
var _ = require('underscore');
var config = require('../config');

function handleItems(category, subcategory, params, callback) {
    helpers.controllers.changeHeaders.call(this, config.get(['cache', 'headers', 'categories', 'items'], config.get(['cache', 'headers', 'default'], {})));

    var slug = helpers.common.slugToUrl(subcategory.toJSON());
    var page = params ? params.page : undefined;
    var app = this.app;
    var spec = {
        items: {
            collection: 'Items',
            params: params
        }
    };
    var query;

    if (slug.indexOf(params.title + '-cat-')) {
        return helpers.common.redirect.call(this, '/' + slug);
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
    helpers.seo.addMetatag('canonical', ['http://', app.session.get('siteLocation'), '/', slug, (query.page && query.page > 1 ? '-p-' + query.page : '')].join(''));
    app.fetch(spec, {
        'readFromCache': false
    }, function afterFetch(err, result) {
        var protocol = app.session.get('protocol');
        var host = app.session.get('host');
        var url = (protocol + '://' + host + '/' + query.title + '-cat-' + query.catId);
        var model = result.items.models[0];

        result.items = model.get('data');
        result.metadata = model.get('metadata');
        if (typeof page !== 'undefined' && (isNaN(page) || page <= 1 || page >= 999999  || !result.items.length)) {
            return helpers.common.redirect.call(this, '/' + slug);
        }
        if (result.metadata.total < 5){
            helpers.seo.addMetatag('robots', 'noindex, nofollow');
            helpers.seo.update();
        }
        helpers.pagination.paginate(result.metadata, query, url);
        analytics.reset();
        analytics.setPage('listing');
        analytics.addParam('category', category.toJSON());
        analytics.addParam('subcategory', subcategory.toJSON());
        result.analytics = analytics.generateURL.call(this);
        result.category = category.toJSON();
        result.subcategory = subcategory.toJSON();
        result.relatedAds = query.relatedAds;
        result.type = 'items';
        callback(err, result);
    }.bind(this));
}

function handleShow(category, params, callback) {
    helpers.controllers.changeHeaders.call(this, config.get(['cache', 'headers', 'categories', 'subcategories'], config.get(['cache', 'headers', 'default'], {})));

    var slug = helpers.common.slugToUrl(category.toJSON());

    if (slug.indexOf(params.title + '-cat-')) {
        return helpers.common.redirect.call(this, '/' + slug);
    }
    analytics.reset();
    analytics.addParam('user', this.app.session.get('user'));
    analytics.addParam('category', category.toJSON());
    helpers.seo.resetHead();
    helpers.seo.addMetatag('title', 'Listing');
    helpers.seo.addMetatag('Description', 'This is a listing page');
    helpers.seo.addMetatag('canonical', ['http://', this.app.session.get('siteLocation'), '/', params.title, '-cat-', params.catId].join(''));
    callback(null, {
        category: category.toJSON(),
        type: 'categories',
        analytics: analytics.generateURL.call(this)
    });
}

module.exports = {
    show: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            this.app.fetch({
                categories: {
                    collection: 'Categories',
                    params: {
                        location: this.app.session.get('siteLocation'),
                        languageCode: this.app.session.get('selectedLanguage')
                    }
                }
            }, {
                readFromCache: false
            }, function afterFetch(err, result) {
                var category = result.categories.get(params.catId);
                var subcategory;

                if (!category) {
                    category = result.categories.find(function each(category) {
                        return !!category.get('children').get(params.catId);
                    });
                    if (!category) {
                        return helpers.common.redirect.call(this, '/');
                    }
                    subcategory = category.get('children').get(params.catId);
                    return handleItems.call(this, category, subcategory, params, callback);
                }
                handleShow.call(this, category, params, callback);
            }.bind(this));
        }
    }
};
