'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var middlewares = require('../middlewares');
var helpers = require('../helpers');
var tracking = require('../modules/tracking');
var Paginator = require('../modules/paginator');
var Seo = require('../modules/seo');
var config = require('../../shared/config');

module.exports = {
    list: middlewares(list),
    show: middlewares(show),
    showig: middlewares(showig)
};

function list(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var platform = this.app.session.get('platform');
        var icons = config.get(['icons', platform], []);
        var country = this.app.session.get('location').url;

        this.app.seo.setContent(this.dependencies.categories.meta);
        callback(null, {
            icons: (~icons.indexOf(country)) ? country.split('.') : 'default'.split('.'),
            tracking: tracking.generateURL.call(this)
        });
    }
}

function showig(params, callback) {
    params['f.hasimage'] = true;
    show.call(this, params, callback, '-ig');
}

function show(params, callback, gallery) {
    helpers.controllers.control.call(this, params, {
        seo: false,
        cache: false
    }, controller);

    function controller() {

        var redirect = function(done){
            var categoryId = this.app.seo.isCategoryDeprecated(params.catId);

            gallery = gallery || '';

            if (categoryId) {
                done.abort();
                return helpers.common.redirect.call(this, ['/cat-', categoryId, gallery].join(''));
            }
            done();
        }.bind(this);

        var router = function(done) {
            var category = this.dependencies.categories.get(params.catId);
            var platform = this.app.session.get('platform');
            var subcategory;

            if (!category) {
                category = this.dependencies.categories.find(function each(category) {
                    return !!category.get('children').get(params.catId);
                });
                if (!category) {
                    done.abort();
                    return helpers.common.redirect.call(this, '/');
                }
                subcategory = category.get('children').get(params.catId);
                handleItems.call(this, params, promise, gallery);
            }
            else if (platform === 'desktop') {
                handleItems.call(this, params, promise, gallery);
            }
            else {
                handleShow.call(this, params, promise);
            }
            promise.val(success);
            done(category, subcategory);
        }.bind(this);

        var success = function(_result) {
            callback(null, _result);
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        var promise = asynquence().or(error)
            .then(redirect)
            .then(router);
    }
}

function handleItems(params, promise, gallery) {
    var page = params ? params.page : undefined;
    var infiniteScroll = config.get('infiniteScroll', false);
    var category;
    var subcategory;
    var query;
    var url;

    var configure = function(done, _category, _subcategory) {
        var currentRouter = ['categories', 'items'];
        var seo = Seo.instance(this.app);

        category = _category;
        subcategory = _subcategory;

        seo.reset(this.app, currentRouter);
        helpers.controllers.changeHeaders.call(this, {}, currentRouter);
        done();
    }.bind(this);

    var redirect = function(done) {
        var platform = this.app.session.get('platform');
        var slug = helpers.common.slugToUrl((subcategory || category).toJSON());

        url = ['/', slug].join('');

        if (platform === 'html5' && infiniteScroll && (typeof page !== 'undefined' && !isNaN(page) && page > 1)) {
            done.abort();
            return helpers.common.redirect.call(this, [url, gallery].join(''));
        }
        if (slug.indexOf(params.title + '-cat-')) {
            done.abort();
            if (page === undefined || isNaN(page) || page <= 1) {
                return helpers.common.redirect.call(this, [url, gallery].join(''));
            }
            return helpers.common.redirect.call(this, [url, '-p-', page, gallery].join(''));
        }
        done();
    }.bind(this);

    var prepare = function(done) {
        Paginator.prepare(this.app, params);

        query = _.clone(params);
        params.categoryId = params.catId;
        params.seo = this.app.seo.isEnabled();
        params.languageId = this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id;
        delete params.catId;
        delete params.title;
        delete params.page;
        delete params.filters;
        done();
    }.bind(this);

    var fetch = function(done) {
        this.app.fetch({
            items: {
                collection: 'Items',
                params: params
            }
        }, {
            readFromCache: false
        }, done.errfcb);
    }.bind(this);

    var paginate = function(done, res) {
        var realPage;

        if (page == 1) {
            done.abort();
            return helpers.common.redirect.call(this, [url, gallery].join(''));
        }
        realPage = res.items.paginate([url, '[page][gallery][filters]'].join(''), query, {
            page: page,
            gallery: gallery
        });
        if (realPage) {
            done.abort();
            return helpers.common.redirect.call(this, [url, '-p-', realPage, gallery].join(''));
        }
        done(res.items);
    }.bind(this);

    var success = function(done, _items) {
        var meta = _items.meta;
        var postingLink = {
            category: category.get('id')
        };
        var currentPage;

        if (subcategory) {
            postingLink.subcategory = subcategory.get('id');
        }
        this.app.session.update({
            postingLink: postingLink
        });

        this.app.seo.setContent(meta);
        if (meta.seo) {
            currentPage = meta.page;
            this.app.seo.addMetatag('title', meta.seo.title + (currentPage > 1 ? (' - ' + currentPage) : ''));
            this.app.seo.addMetatag('description', meta.seo.description + (currentPage > 1 ? (' - ' + currentPage) : ''));
        }
        if (meta.total < 5) {
            this.app.seo.addMetatag('robots', 'noindex, follow');
            this.app.seo.addMetatag('googlebot', 'noindex, follow');
        }

        tracking.setPage('listing');
        tracking.addParam('category', category.toJSON());
        if (subcategory) {
            tracking.addParam('subcategory', subcategory.toJSON());
        }
        tracking.addParam('page', meta.page);

        done({
            type: 'items',
            category: category.toJSON(),
            subcategory: (subcategory || category).toJSON(),
            currentCategory: (subcategory ? subcategory.toJSON() : category.toJSON()),
            relatedAds: query.relatedAds,
            meta: meta,
            items: _items.toJSON(),
            filters: _items.filters,
            infiniteScroll: infiniteScroll,
            tracking: tracking.generateURL.call(this)
        });
    }.bind(this);

    promise.then(configure);
    promise.then(redirect);
    promise.then(prepare);
    promise.then(fetch);
    promise.then(paginate);
    promise.then(success);
}

function handleShow(params, promise) {
    var category;

    var configure = function(done, _category) {
        var currentRouter = ['categories', 'subcategories'];
        var seo = Seo.instance(this.app);

        category = _category;

        seo.reset(this.app, currentRouter);
        helpers.controllers.changeHeaders.call(this, {}, currentRouter);
        done();
    }.bind(this);

    var redirect = function(done) {
        var slug = helpers.common.slugToUrl(category.toJSON());

        if (!category.checkSlug(slug, params.title)) {
            done.abort();
            return helpers.common.redirect.call(this, '/' + slug);
        }
        done();
    }.bind(this);

    var success = function(done) {
        this.app.session.update({
            postingLink: {
                category: category.get('id')
            }
        });

        this.app.seo.addMetatag('title', category.get('trName'));
        this.app.seo.addMetatag('description', category.get('trName'));

        tracking.addParam('category', category.toJSON());

        done({
            type: 'categories',
            category: category.toJSON(),
            tracking: tracking.generateURL.call(this)
        });
    }.bind(this);

    promise.then(configure);
    promise.then(redirect);
    promise.then(success);
}
