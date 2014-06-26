'use strict';

var helpers = require('../helpers');
var seo = require('../seo');
var _ = require('underscore');
var config = require('../config');

function handleItems(category, subcategory, params, callback) {
    var currentRouter = ['categories', 'items'];

    helpers.controllers.changeHeaders.call(this, false, currentRouter);
    seo.resetHead.call(this, currentRouter);

    var slug = helpers.common.slugToUrl(subcategory.toJSON());
    var page = params ? params.page : undefined;
    var app = this.app;
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
    app.fetch({
        items: {
            collection: 'Items',
            params: params
        }
    }, {
        readFromCache: false
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
            seo.addMetatag('robots', 'noindex, follow');
            seo.update();
        }
        helpers.pagination.paginate(result.metadata, query, url);
        helpers.analytics.reset();
        helpers.analytics.setPage('listing');
        helpers.analytics.addParam('category', category.toJSON());
        helpers.analytics.addParam('subcategory', subcategory.toJSON());
        result.analytics = helpers.analytics.generateURL(app.session.get());
        result.category = category.toJSON();
        result.subcategory = subcategory.toJSON();
        result.relatedAds = query.relatedAds;
        result.type = 'items';
        callback(err, result);
    }.bind(this));
}

function handleShow(category, params, callback) {
    var currentRouter = ['categories', 'subcategories'];

    helpers.controllers.changeHeaders.call(this, false, currentRouter);
    seo.resetHead.call(this, currentRouter);

    var slug = helpers.common.slugToUrl(category.toJSON());

    if (slug.indexOf(params.title + '-cat-')) {
        return helpers.common.redirect.call(this, '/' + slug);
    }
    helpers.analytics.reset();
    helpers.analytics.addParam('user', this.app.session.get('user'));
    helpers.analytics.addParam('category', category.toJSON());
    callback(null, {
        category: category.toJSON(),
        type: 'categories',
        analytics: helpers.analytics.generateURL(this.app.session.get())
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
                helpers.analytics.reset();
                callback(null, {
                    categories: result.categories.toJSON(),
                    icons: (~icons.indexOf(country)) ? country.split('.') : 'default'.split('.'),
                    analytics: helpers.analytics.generateURL(this.app.session.get())
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
