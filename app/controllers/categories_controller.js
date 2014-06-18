'use strict';

var helpers = require('../helpers');
var _ = require('underscore');

function handleItems(category, subcategory, params, callback) {
    var slug = helpers.common.slugToUrl(subcategory.toJSON());
    var page = params ? params.page : undefined;
    var app = this.app;
    var spec = {
        items: {
            collection: 'Items',
            params: params
        }
    };
    var query = _.clone(params);

    if (slug.indexOf(params.title + '-cat-')) {
        return helpers.common.redirect.call(this, '/' + slug);
    }
    helpers.pagination.prepare(app, params);
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
        helpers.analytics.reset();
        helpers.analytics.setPage('listing');
        helpers.analytics.addParam('category', category.toJSON());
        helpers.analytics.addParam('subcategory', subcategory.toJSON());
        result.analytics = helpers.analytics.generateURL(app.session.get());
        result.category = category.toJSON();
        result.type = 'items';
        callback(err, result);
    }.bind(this));
}

function handleShow(category, params, callback) {
    var slug = helpers.common.slugToUrl(category.toJSON());

    if (slug.indexOf(params.title + '-cat-')) {
        return helpers.common.redirect.call(this, '/' + slug);
    }
    helpers.analytics.reset();
    helpers.analytics.addParam('user', this.app.session.get('user'));
    helpers.analytics.addParam('category', category.toJSON());
    helpers.seo.resetHead();
    helpers.seo.addMetatag('title', 'Listing');
    helpers.seo.addMetatag('Description', 'This is a listing page');
    helpers.seo.addMetatag('canonical', ['http://', this.app.session.get('siteLocation'), '/', params.title, '-cat-', params.catId].join(''));
    callback(null, {
        category: category.toJSON(),
        type: 'categories',
        analytics: helpers.analytics.generateURL(this.app.session.get())
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
