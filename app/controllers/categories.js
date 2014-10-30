'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var middlewares = require('../middlewares');
var helpers = require('../helpers');
var tracking = require('../modules/tracking');
var config = require('../../shared/config');
var Seo = require('../modules/seo');

module.exports = {
    list: middlewares(list),
    show: middlewares(show),
    showig: middlewares(showig)
};

function list(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var seo = Seo.instance(this.app);

        var fetch = function(done) {
            this.app.fetch({
                cities: {
                    collection: 'Cities',
                    params: {
                        level: 'countries',
                        type: 'topcities',
                        location: this.app.session.get('siteLocation')
                    }
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var success = function(response) {
            var platform = this.app.session.get('platform');
            var icons = config.get(['icons', platform], []);
            var country = this.app.session.get('location').url;
            var categories = this.app.session.get('categories');

            seo.addMetatag('title', categories.metadata.title);
            seo.addMetatag('description', categories.metadata.description);
            seo.setContent(categories.metadata.seo);
            console.log(seo.get('h1'));


            callback(null, {
                cities: response.cities.toJSON(),
                categories: categories.toJSON(),
                icons: (~icons.indexOf(country)) ? country.split('.') : 'default'.split('.'),
                tracking: tracking.generateURL.call(this),
                seo: seo
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(fetch)
            .val(success);
    }
}

function showig(params, callback) {
    params['f.hasimage'] = true;
    show.call(this, params, callback, '-ig');
}

function show(params, callback, isGallery) {
    helpers.controllers.control.call(this, params, {
        seo: false,
        cache: false
    }, controller);

    function controller() {
        var seo = Seo.instance(this.app);
      //  seo.set('h1',seo.get("levelPath").top.pop().anchor);
        var redirect = function(done){
            var categoryId = seo.getCategoryId(params.catId);

            if (categoryId) {
                done.abort();
                return helpers.common.redirect.call(this, ['/cat-', categoryId, isGallery || ''].join(''));
            }
            done();
        }.bind(this);

        var fetch = function(done) {
            this.app.fetch({
                categories: {
                    collection: 'Categories',
                    params: {
                        location: this.app.session.get('siteLocation'),
                        languageCode: this.app.session.get('selectedLanguage'),
                        seo: seo.isEnabled()
                    }
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var router = function(done, res) {
            if (!res.categories) {
                return done.fail(null, {});
            }
            var category = res.categories.get(params.catId);
            var platform = this.app.session.get('platform');
            var subcategory;

            if (!category) {
                category = res.categories.find(function each(category) {
                    return !!category.get('children').get(params.catId);
                });
                if (!category) {
                    done.abort();
                    return helpers.common.redirect.call(this, '/');
                }
                subcategory = category.get('children').get(params.catId);
                handleItems.call(this, params, promise, isGallery || '');
            }
            else if (platform === 'desktop') {
                handleItems.call(this, params, promise, isGallery || '');
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
            .then(fetch)
            .then(router);
    }
}

function handleItems(params, promise, isGallery) {
    var seo = Seo.instance(this.app);
    var page = params ? params.page : undefined;
    var infiniteScroll = config.get('infiniteScroll', false);
    var platform = this.app.session.get('platform');
    var category;
    var subcategory;
    var query;
    var url;

    var prepare = function(done, _category, _subcategory) {
        var currentRouter = ['categories', 'items'];
        var slug;

        isGallery = isGallery || '';

        category = _category;
        subcategory = _subcategory;

        helpers.controllers.changeHeaders.call(this, {}, currentRouter);
        seo.reset(this.app, currentRouter);

        slug = helpers.common.slugToUrl((subcategory || category).toJSON());
        url = ['/', slug].join('');

        if (platform === 'html5' && infiniteScroll && (typeof page !== 'undefined' && !isNaN(page) && page > 1)) {
            done.abort();
            return helpers.common.redirect.call(this, [url, isGallery].join(''));
        }
        if (slug.indexOf(params.title + '-cat-')) {
            done.abort();
            if (page === undefined || isNaN(page) || page <= 1) {
                return helpers.common.redirect.call(this, [url, isGallery].join(''));
            }
            return helpers.common.redirect.call(this, [url, '-p-', page, isGallery].join(''));
        }

        helpers.pagination.prepare(this.app, params);

        query = _.clone(params);
        params.categoryId = params.catId;
        params.seo = seo.isEnabled();
        params.languageId = this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id;
        delete params.catId;
        delete params.title;
        delete params.page;
        delete params.filters;
        delete params.urlFilters;
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
            return helpers.common.redirect.call(this, [url, isGallery].join(''));
        }
        realPage = res.items.paginate(page, query, url, isGallery);
        if (realPage) {
            done.abort();
            return helpers.common.redirect.call(this, [url, '-p-', realPage, isGallery].join(''));
        }
        done(res.items);
    }.bind(this);

    var success = function(done, _items) {
        var metadata = _items.metadata;
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

        seo.setContent(metadata.seo);
        if (metadata.seo) {
            currentPage = metadata.page;
            seo.addMetatag('title', metadata.seo.title + (currentPage > 1 ? (' - ' + currentPage) : ''));
            seo.addMetatag('description', metadata.seo.description + (currentPage > 1 ? (' - ' + currentPage) : ''));
        }
        if (metadata.total < 5) {
            seo.addMetatag('robots', 'noindex, follow');
            seo.addMetatag('googlebot', 'noindex, follow');
        }

        tracking.setPage('listing');
        tracking.addParam('category', category.toJSON());
        if (subcategory) {
            tracking.addParam('subcategory', subcategory.toJSON());
        }
        tracking.addParam('page', metadata.page);

        done({
            type: 'items',
            category: category.toJSON(),
            subcategory: (subcategory || category).toJSON(),
            currentCategory: (subcategory ? subcategory.toJSON() : category.toJSON()),
            relatedAds: query.relatedAds,
            metadata: metadata,
            seo: seo,
            items: _items.toJSON(),
            infiniteScroll: infiniteScroll,
            tracking: tracking.generateURL.call(this)
        });
    }.bind(this);

    promise.then(prepare);
    promise.then(fetch);
    promise.then(paginate);
    promise.then(success);
}

function handleShow(params, promise) {
    var seo = Seo.instance(this.app);

    var prepare = function(done, _category) {
        var currentRouter = ['categories', 'subcategories'];
        var slug;

        helpers.controllers.changeHeaders.call(this, {}, currentRouter);
        seo.reset(this.app, currentRouter);

        slug = helpers.common.slugToUrl(_category.toJSON());
        if (!_category.checkSlug(slug, params.title)) {
            done.abort();
            return helpers.common.redirect.call(this, '/' + slug);
        }
        done(_category);
    }.bind(this);

    var success = function(done, _category) {
        this.app.session.update({
            postingLink: {
                category: _category.get('id')
            }
        });

        seo.addMetatag('title', _category.get('trName'));
        seo.addMetatag('description', _category.get('trName'));

        tracking.addParam('category', _category.toJSON());

        done({
            type: 'categories',
            category: _category.toJSON(),
            tracking: tracking.generateURL.call(this)
        });
    }.bind(this);

    promise.then(prepare);
    promise.then(success);
}
