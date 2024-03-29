'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var URLParser = require('url');
var middlewares = require('../middlewares');
var helpers = require('../helpers');
var Paginator = require('../modules/paginator');
var Seo = require('../modules/seo');
var FeatureAd = require('../models/feature_ad');
var config = require('../../shared/config');
var utils = require('../../shared/utils');
var Shops = require('../modules/shops');
var Abundance = require('../modules/abundance');

module.exports = {
    home: middlewares(home),
    list: middlewares(list),
    show: middlewares(show),
    showig: middlewares(showig)
};

function home(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var promise = asynquence().or(fail.bind(this));
        var alternative = utils.underscorize(this.app.sixpack.experiments.dgdHomePage.alternative);

        if (alternative === 'amazon') {
            promise
                .then(prepare.bind(this))
                .then(fetch.bind(this));
        }
        promise.val(success.bind(this));

        function prepare(done) {
            var params = {
                seo: false,
                offset: 0,
                pageSize: 20,
                'f.hasimage': true,
                'f.pricerange': '1TO',
                location: this.app.session.get('location').url,
                languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
            };
            var spec = {};
            var categories = config.get(['amazonExperiment', this.app.session.get('location').url, 'categories'], []);

            spec.popularsearches = {
                collection: 'Items',
                params: _.extend({}, params, {
                    item_type: 'popularsearches'
                })
            };
            _.each(categories, function each(id) {
                spec[id] = {
                    collection: 'Items',
                    params: _.extend({}, params, {
                        categoryId: id
                    })
                };
            });
            done(spec);
        }

        function fetch(done, spec) {
            this.app.fetch(spec, {
                readFromCache: true
            }, done.errfcb);
        }

        function success(res) {
            var data = {
                topics: []
            };

            if (res) {
                _.each(res, function each(topic, id) {
                    var category;

                    if (!isNaN(id)) {
                        category = this.dependencies.categories.search(id).toJSON();
                        topic.name = category.trName;
                        topic.url =  helpers.common.slugToUrl.call(this, category);
                        return data.topics.push(topic);
                    }
                    data.topics.unshift(topic);
                }, this);
            }
            callback(null, 'home/' + alternative, data);
        }

        function fail(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }
    }
}

function list(params, callback) {
    var homePageExperiment = this.app.sixpack.experiments.dgdHomePage;

    if (homePageExperiment && homePageExperiment.alternative !== 'control') {
        this.currentRoute = {
            controller: 'categories',
            action: 'home'
        };
        return home.call(this, params, callback);
    }

    helpers.controllers.control.call(this, params, controller);

    function controller() {

        var fetch = function(done) {
            if (!FeatureAd.isEnabled(this.app)) {
                return done();
            }
            var languages = this.app.session.get('languages');

            params.seo = this.app.seo.isEnabled();
            params.languageId = languages._byId[this.app.session.get('selectedLanguage')].id;
            Paginator.prepare(this.app, params);

            this.app.fetch({
                featureads: {
                    collection: 'FeatureAds',
                    params: params
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var success = function(res) {
            var platform = this.app.session.get('platform');
            var icons = config.get(['icons', platform], []);
            var location = this.app.session.get('location');
            var country = location.url;

            this.app.seo.setContent(this.dependencies.categories.meta);
            callback(null, {
                icons: (~icons.indexOf(country)) ? country.split('.') : 'default'.split('.'),
                items: res ? res.featureads : undefined
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
    var platform = this.app.session.get('platform');
    var gallery;
    
    if(platform === 'desktop' || platform === 'html5') {
        gallery = '-ig';
    }
    params['f.hasimage'] = true;
    show.call(this, params, callback, gallery);
}

function show(params, callback, gallery) {
    helpers.controllers.control.call(this, params, {
        seo: false,
        cache: false
    }, controller);

    function controller() {
        var promise = asynquence().or(fail.bind(this))
            .then(redirect.bind(this))
            .then(router.bind(this));

        function redirect(done) {
            var categoryId = Seo.isCategoryRedirected(this.app.session.get('location').url, params.catId);
            var categories = this.dependencies.categories;
            var category;
            var subcategory;
            var slug;

            gallery = gallery || '';
            if (!categoryId) {
                return done();
            }
            done.abort();
            category = categories.search(categoryId);
            if (!category) {
                category = categories.get(categoryId);
                if (!category) {
                    return helpers.common.redirect.call(this, '/');
                }
            }
            if (category.has('parentId')) {
                subcategory = category;
                category = categories.get(subcategory.get('parentId'));
            }
            slug = helpers.common.slugToUrl((subcategory || category).toJSON());
            return helpers.common.redirect.call(this, [slug, gallery].join(''));
        }

        function router(done) {
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
            promise.val(success.bind(this));
            done(category, subcategory);
        }

        function success(_result) {
            callback(null, _result);
        }

        function fail(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }
    }
}

function handleItems(params, promise, gallery) {
    var page = params ? params.page : undefined;
    var languages = this.app.session.get('languages');
    var path = this.app.session.get('path');
    var starts = '/nf';
    var category;
    var subcategory;
    var query;
    var url;
    var shopsModule = new Shops(this);
    var abundance = new Abundance({}, this);

    var configure = function(done, _category, _subcategory) {
        var currentRouter = ['categories', 'items'];

        category = _category;
        subcategory = _subcategory;

        this.app.seo.reset(this.app, {
            page: currentRouter
        });
        helpers.controllers.changeHeaders.call(this, {}, currentRouter);
        helpers.controllers.schibsted.call(this, params, done);
    }.bind(this);

    var redirect = function(done) {
        var platform = this.app.session.get('platform');
        var slug = helpers.common.slugToUrl((subcategory || category).toJSON());
        var redirectParams = {
            replace: true
        };

        url = ['/', slug].join('');

        if (slug.indexOf(params.title + '-cat-')) {
            done.abort();
            if (page === undefined || isNaN(page) || page <= 1) {
                return helpers.common.redirect.call(this, [url, gallery].join(''));
            }
            return helpers.common.redirect.call(this, [url, '-p-', page, gallery].join(''));
        }
        if ((params.filters && params.filters !== 'undefined') && !utils.startsWith(path, starts)) {
            done.abort();
            return helpers.common.redirect.call(this, [starts, path, URLParser.parse(this.app.session.get('url')).search || ''].join(''), null, redirectParams);
        }
        else if ((!params.filters || params.filters === 'undefined') && utils.startsWith(path, starts)) {
            done.abort();
            return helpers.common.redirect.call(this, [path.replace(starts, ''), URLParser.parse(this.app.session.get('url')).search || ''].join(''), null, redirectParams);
        }
        done();
    }.bind(this);

    var prepare = function(done) {
        Paginator.prepare(this.app, params);

        query = _.clone(params);
        params.categoryId = params.catId;
        params.abundance = true;
        params.seo = this.app.seo.isEnabled();
        params.languageId = languages._byId[this.app.session.get('selectedLanguage')].id;
        delete params.catId;
        delete params.title;
        delete params.page;
        delete params.filters;
        done();
    }.bind(this);

    var fetchFeatured = function(done) {
        if (!FeatureAd.isEnabled(this.app)) {
            return done();
        }
        this.app.fetch({
            featureads: {
                collection: 'FeatureAds',
                params: _.clone(params)
            }
        }, {
            readFromCache: false
        }, done.errfcb);
    }.bind(this);

    var fetch = function(done, res) {
        var collections = {
            items: {
                collection: 'Items',
                params: params
            }
        };
        if (shopsModule.shouldGetShops()) {
            collections.shops = {
                collection: 'Shops',
                params: _.clone(params),
            };
            collections.shops.params.pageSize = 3;
            collections.shops.params.offset = 3 * (params.offset / params.pageSize);
        }
        this.app.fetch(collections, {
            readFromCache: false
        }, function afterFetch(err, response) {
            if (err || !response.items) {
                return done.fail(err);
            }
            if (response && res && res.featureads) {
                res.featureads.mergeTo(response.items);
            }
            done(response);
        });
    }.bind(this);

    var fetchAbundance = function(done, res) {
        if (abundance.isEnabled() && res.items.meta.abundance) {
            abundance.set('params', params);
            return abundance.fetch(done, res);
        }
        done(res);
    }.bind(this);

    var filters = function(done, res) {
        var url = this.app.session.get('url');
        var filter;
        var _filters;

        filter = query.filters;
        if (!filter || filter === 'undefined') {
            return done(res);
        }
        _filters = res.items.filters.format();
        if (filter !== _filters) {
            done.abort();
            url = [path.split('/-').shift(), (_filters ? '/' + _filters : ''), URLParser.parse(url).search || ''].join('');
            return helpers.common.redirect.call(this, url);
        }
        done(res);
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
        done(res.items, res.shops);
    }.bind(this);

    var success = function(done, items, shops) {
        var meta = items.meta;
        var dataPage = {
            category: category.get('id')
        };

        if (subcategory) {
            dataPage.subcategory = subcategory.get('id');
        }
        this.app.session.update({
            dataPage: dataPage
        });

        this.app.seo.setContent(meta);
        if (meta.total < 5) {
            this.app.seo.addMetatag('robots', 'noindex, follow');
            this.app.seo.addMetatag('googlebot', 'noindex, follow');
        }

        this.app.tracking.setPage('listing');
        this.app.tracking.set('category', category.toJSON());
        if (subcategory) {
            this.app.tracking.set('subcategory', subcategory.toJSON());
        }
        this.app.tracking.set('page', query.page);
        this.app.tracking.set('filters', items.filters);
        this.app.tracking.set('paginator', items.paginator);

        if (shopsModule.enabled()) {
            shopsModule.start("fetch-categories", items.length, shops !== undefined ? shops.length : 0);
        }

        done({
            type: 'items',
            category: category.toJSON(),
            subcategory: (subcategory || category).toJSON(),
            currentCategory: (subcategory ? subcategory.toJSON() : category.toJSON()),
            relatedAds: query.relatedAds,
            meta: meta,
            items: items.toJSON(),
            shops: shops !== undefined ? shops.toJSON() : [],
            filters: items.filters,
            paginator: items.paginator,
            hasItemsWithImages: items.hasImages()
        });
    }.bind(this);

    promise.then(configure);
    promise.then(redirect);
    promise.then(prepare);
    promise.then(fetchFeatured);
    promise.then(fetch);
    promise.then(fetchAbundance);
    promise.then(filters);
    promise.then(paginate);
    promise.then(success);
}

function handleShow(params, promise) {
    var category;

    var configure = function(done, _category) {
        var currentRouter = ['categories', 'subcategories'];

        category = _category;

        this.app.seo.reset(this.app, {
            page: currentRouter
        });
        helpers.controllers.changeHeaders.call(this, {}, currentRouter);
        helpers.controllers.schibsted.call(this, params, done);
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
        var currentCategory = category.toJSON();

        this.app.session.update({
            dataPage: {
                category: category.get('id')
            }
        });

        this.app.seo.addMetatag('title', category.get('trName'));
        this.app.seo.addMetatag('description', category.get('trName'));

        this.app.tracking.set('category', currentCategory);

        done({
            type: 'categories',
            category: currentCategory,
            currentCategory: currentCategory
        });
    }.bind(this);

    promise.then(configure);
    promise.then(redirect);
    promise.then(success);
}
