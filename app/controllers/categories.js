'use strict';

var _ = require('underscore');
var helpers = require('../helpers');
var seo = require('../seo');
var analytics = require('../analytics');
var config = require('../config');

function handleItems(category, subcategory, params, callback) {
    var currentRouter = ['categories', 'items'];

    helpers.controllers.changeHeaders.call(this, false, currentRouter);
    seo.resetHead.call(this, currentRouter);

    var slug = helpers.common.slugToUrl(subcategory.toJSON());
    var page = params ? params.page : undefined;
    var query;

    if (slug.indexOf(params.title + '-cat-')) {
        return helpers.common.redirect.call(this, '/' + slug);
    }
    helpers.pagination.prepare(this.app, params);
    query = _.clone(params);
    params.categoryId = params.catId;
    delete params.catId;
    delete params.title;
    delete params.page;
    delete params.filters;
    delete params.urlFilters;
    this.app.fetch({
        items: {
            collection: 'Items',
            params: params
        }
    }, {
        readFromCache: false
    }, function afterFetch(err, result) {
        var url = '/' + query.title + '-cat-' + query.catId;
        var model = result.items.models[0];

        result.items = model.get('data');
        result.metadata = model.get('metadata');
        if (typeof page !== 'undefined' && (isNaN(page) || page <= 1 || page >= 999999  || !result.items.length)) {
            return helpers.common.redirect.call(this, '/' + slug);
        }
        if (result.metadata.total < 5) {
            seo.addMetatag('robots', 'noindex, follow');
            seo.update();
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
    var currentRouter = ['categories', 'subcategories'];
    var slug;

    helpers.controllers.changeHeaders.call(this, false, currentRouter);
    seo.resetHead.call(this, currentRouter);

    slug = helpers.common.slugToUrl(category.toJSON());
    if (slug.indexOf(params.title + '-cat-')) {
        return helpers.common.redirect.call(this, '/' + slug);
    }
    analytics.reset();
    analytics.addParam('user', this.app.session.get('user'));
    analytics.addParam('category', category.toJSON());
    callback(null, {
        category: category.toJSON(),
        type: 'categories',
        analytics: analytics.generateURL.call(this)
    });
}

module.exports = {
    list: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var platform = this.app.session.get('platform');
            var icons = config.get(['icons', platform], []);
            var country = this.app.session.get('location').url;
            var siteLocation = this.app.session.get('siteLocation');

            this.app.fetch({
                categories: {
                    collection: 'Categories',
                    params: {
                        location: siteLocation,
                        languageCode: this.app.session.get('selectedLanguage')
                    }
                }
            }, {
                readFromCache: false
            }, function afterFetch(err, result) {
                analytics.reset();
                callback(null, {
                    categories: result.categories.toJSON(),
                    icons: (~icons.indexOf(country)) ? country.split('.') : 'default'.split('.'),
                    analytics: analytics.generateURL.call(this)
                });
            }.bind(this));
        }
    },
    show: function(params, callback) {
        helpers.controllers.control.call(this, params, {
            seo: false,
            cache: false
        }, controller);

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
