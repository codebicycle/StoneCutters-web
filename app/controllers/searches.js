'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var URLParser = require('url');
var middlewares = require('../middlewares');
var helpers = require('../helpers');
var Seo = require('../modules/seo');
var Paginator = require('../modules/paginator');
var FeatureAd = require('../models/feature_ad');
var config = require('../../shared/config');
var utils = require('../../shared/utils');
var config = require('../../shared/config');
var statsd = require('../../shared/statsd')();
var Shops = require('../modules/shops');
var Abundance = require('../modules/abundance');

module.exports = {
    filterig: middlewares(filterig),
    filter: middlewares(filter),
    searchig: middlewares(searchig),
    search: middlewares(search),
    statics: middlewares(statics),
    allresults: middlewares(allresults),
    allresultsig: middlewares(allresultsig)
};

function filterig(params, callback) {
    var platform = this.app.session.get('platform');
    var gallery;
    
    if(platform === 'desktop' || platform === 'html5') {
        gallery = '-ig';
    }
    params['f.hasimage'] = true;
    filter.call(this, params, callback, gallery);
}

function filter(params, callback, gallery) {
    params.categoryId = params.catId;
    search.call(this, params, callback, gallery);
}

function searchig(params, callback) {
    var platform = this.app.session.get('platform');
    var gallery;
    
    if(platform === 'desktop' || platform === 'html5') {
        gallery = '-ig';
    }
    params['f.hasimage'] = true;
    search.call(this, params, callback, gallery);
}

function search(params, callback, gallery) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var page = params ? params.page : undefined;
        var platform = this.app.session.get('platform');
        var languages = this.app.session.get('languages');
        var location = this.app.session.get('location');
        var path = this.app.session.get('path');
        var shopsModule = new Shops(this);
        var starts = '/nf';
        var redirectParams = {
            replace: true
        };
        var query;
        var url;
        var category;
        var subcategory;
        var abundance = new Abundance({}, this);

        asynquence().or(fail.bind(this))
            .then(buildUrl.bind(this))
            .then(redirect.bind(this))
            .then(configure.bind(this))
            .then(check.bind(this))
            .then(prepare.bind(this))
            .then(fetchFeatured.bind(this))
            .then(fetch.bind(this))
            .then(fetchAbundance.bind(this))
            .then(filters.bind(this))
            .then(paginate.bind(this))
            .then(metrics.bind(this))
            .val(success.bind(this));

        function buildUrl(done) {
            url = [starts, '/'];
            gallery = gallery || '';

            if (params.catId) {
                url.push(params.title);
                url.push('-cat-');
                url.push(params.categoryId);
            }
            else {
                url.push('search');
            }
            url.push('/');
            url.push(params.search);
            url = url.join('');
            done();
        }

        function findCategory(categoryId) {
            var categories = this.dependencies.categories;

            category = categories.search(categoryId);
            if (!category) {
                category = categories.get(categoryId);
                if (!category) {
                    return false;
                }
            }
            if (category.has('parentId')) {
                subcategory = category;
                category = categories.get(subcategory.get('parentId'));
            }
            return true;
        }

        function redirect(done) {
            var categoryId;
            var slug;

            if (!params.search || _.isEmpty(params.search.trim()) || params.search === 'undefined') {
                done.abort();
                return helpers.common.redirect.call(this, '/nf/all-results', null, redirectParams);
            }
            if (!utils.startsWith(path, starts)) {
                done.abort();
                return helpers.common.redirect.call(this, [starts, path].join(''));
            }
            if (params.catId) {
                categoryId = Seo.isCategoryRedirected(location.url, params.catId);
                if (categoryId) {
                    done.abort();
                    if (!findCategory.call(this, categoryId)) {
                        return helpers.common.redirect.call(this, '/');
                    }
                    slug = helpers.common.slugToUrl((subcategory || category).toJSON());
                    return helpers.common.redirect.call(this, [url.replace(params.title + '-cat-' + params.catId, slug), '/', gallery].join(''));
                }
            }
            done();
        }

        function configure(done) {
            if (params.catId && !category && !findCategory.call(this, params.catId)) {
                done.abort();
                return helpers.common.redirect.call(this, '/');
            }
            done();
        }

        function check(done) {
            var cat = '-cat-';
            var slug;
            var slugUrl;

            if (params.catId) {
                slug = helpers.common.slugToUrl((subcategory || category).toJSON());
                slugUrl = params.title + cat + params.catId;

                if (slug.indexOf(slugUrl)) {
                    done.abort();
                    return helpers.common.redirect.call(this, path.replace(slugUrl, slug), null, redirectParams);
                }
            }
            done();
        }

        function prepare(done) {
            params.seo = this.app.seo.isEnabled();
            params.abundance = true;
            params.languageId = languages._byId[this.app.session.get('selectedLanguage')].id;
            Paginator.prepare(this.app, params);

            if (params.catId) {
                if (subcategory) {
                    params['f.category'] = subcategory.get('id');
                }
                if (category) {
                    params['f.parentcategory'] = category.get('id');
                }
            }

            query = _.clone(params);
            delete params.search;
            delete params.page;
            delete params.filters;
            delete params.catId;
            delete params.categoryId;

            this.app.seo.addMetatag('robots', 'noindex, nofollow');
            this.app.seo.addMetatag('googlebot', 'noindex, nofollow');

            this.app.tracking.set('keyword', query.search);
            this.app.tracking.set('page_nb', 0);

            done();
        }

        function fetchFeatured(done) {
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
        }

        function fetch(done, res) {
            var spec = {
                items: {
                    collection: 'Items',
                    params: params
                } 
            };

            if (shopsModule.shouldGetShops()) {
                spec.shops = {
                    collection: 'Shops',
                    params: _.extend({}, params, {
                        pageSize: 3,
                        offset: 3 * (params.offset / params.pageSize)
                    }),
                };
            }

            this.app.fetch(spec, {
                readFromCache: false
            }, function afterFetch(err, response) {
                if (err) {
                    return done.fail(err);
                }
                if (response && res && res.featureads) {
                    res.featureads.mergeTo(response.items);
                }
                done(response);
            });
        }

        function fetchAbundance(done, res) {
            if (abundance.isEnabled() && res.items.meta.abundance) {
                abundance.set('params', params);
                return abundance.fetch(done, res);
            }
            done(res);
        }

        function filters(done, res) {
            var url = this.app.session.get('url');
            var filter;
            var _filters;

            if (!res.items) {
                return done.fail(null, {});
            }
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
        }

        function paginate(done, res) {
            var realPage;

            if (page == 1) {
                done.abort();
                return helpers.common.redirect.call(this, [url, '/', gallery].join(''));
            }
            realPage = res.items.paginate([url, '/[page][gallery][filters]'].join(''), query, {
                page: page,
                gallery: gallery
            });
            if (realPage) {
                done.abort();
                return helpers.common.redirect.call(this, [url, '/-p-', realPage, gallery].join(''));
            }
            done(res.items, res.shops);
        }

        function metrics(done, items, shops) {
            var type = (gallery ? 'gallery' : 'listing');
            var quantity = 'empty';

            if (items.meta.total) {
                if (items.meta.total <= 10) {
                    quantity = 10;
                }
                else if (items.meta.total <= 50) {
                    quantity = 50;
                }
                else if (items.meta.total <= 100) {
                    quantity = 100;
                }
                else {
                    quantity = 'enough';
                }
            }
            statsd.increment([location.abbreviation, 'dgd', 'search', 'qty', type, quantity, platform]);
            done(items, shops);
        }

        function success(items, shops) {
            var _category = category ? category.toJSON() : undefined;
            var _subcategory = subcategory ? subcategory.toJSON() : undefined;

            this.app.seo.setContent(items.meta);
            if (items.meta.total < 5) {
                this.app.seo.addMetatag('robots', 'noindex, nofollow');
                this.app.seo.addMetatag('googlebot', 'noindex, nofollow');
            }

            this.app.tracking.set('page_nb', items.meta.totalPages);
            this.app.tracking.set('section', query.categoryId);
            this.app.tracking.set('page', page);
            this.app.tracking.set('category', _category);
            this.app.tracking.set('subcategory', _subcategory);
            this.app.tracking.set('filters', items.filters);
            this.app.tracking.set('paginator', items.paginator);

            this.app.session.persist({
                currentSearch: query.search
            });
            this.app.session.update({
                dataPage: {
                    search: query.search,
                    category: _category ? _category.id : undefined,
                    subcategory: _subcategory ? _subcategory.id : undefined
                }
            });
            if (shopsModule.enabled()) {
                shopsModule.start("fetch-search", items.length, shops !== undefined ? shops.length : 0);
            }

            callback(null, ['searches/search', gallery.replace('-', '')].join(''), {
                items: items.toJSON(),
                shops: shops !== undefined ? shops.toJSON() : [],
                meta: items.meta,
                filters: items.filters,
                paginator: items.paginator,
                search: query.search,
                category: category,
                subcategory: subcategory,
                currentCategory: subcategory || category
            });
        }

        function fail(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }
    }
}

function statics(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var page = params ? params.page : undefined;
        var platform = this.app.session.get('platform');
        var location = this.app.session.get('location');
        var languages = this.app.session.get('languages');
        var url = ['/q/', params.search, (params.catId ? ['/c-', params.catId].join('') : '')].join('');
        var query;
        var category;
        var subcategory;

        asynquence().or(fail.bind(this))
            .then(redirect.bind(this))
            .then(configure.bind(this))
            .then(check.bind(this))
            .then(prepare.bind(this))
            .then(fetchFeatured.bind(this))
            .then(fetch.bind(this))
            .then(filters.bind(this))
            .then(paginate.bind(this))
            .val(success.bind(this));

        function findCategory(categoryId) {
            var categories = this.dependencies.categories;

            category = categories.search(categoryId);
            if (!category) {
                category = categories.get(categoryId);
                if (!category) {
                    return false;
                }
            }
            if (category.has('parentId')) {
                subcategory = category;
                category = categories.get(subcategory.get('parentId'));
            }
            return true;
        }

        function redirect(done) {
            var categoryId;

            if (params.search && params.search.toLowerCase() === 'gumtree' && this.app.session.get('location').url === 'www.olx.co.za') {
                done.abort();
                return helpers.common.redirect.call(this, '/q/-');
            }
            if (params.catId) {
                categoryId = Seo.isCategoryRedirected(location.url, params.catId);
                if (categoryId) {
                    done.abort();
                    if (!findCategory.call(this, categoryId)) {
                        return helpers.common.redirect.call(this, '/');
                    }
                    return helpers.common.redirect.call(this, this.app.session.get('path').replace('/c-' + params.catId, '/c-' + categoryId));
                }
            }
            done();
        }

        function configure(done) {
            if (params.catId && !category && !findCategory.call(this, params.catId)) {
                done.abort();
                return helpers.common.redirect.call(this, '/');
            }
            done();
        }

        function check(done) {
            if (params && params.filters) {
                if (params.filters === '-ig') {
                    done.abort();
                    return helpers.common.redirect.call(this, this.app.session.get('path').replace('/-ig', '/'));
                }
                url = [];
                url.push('/nf/');
                url.push(params.search);
                if (params.catId) {
                    url.pop();
                    url.push(helpers.common.slugToUrl((subcategory || category).toJSON()));
                    url.push('/');
                    url.push(params.search);
                }
                if (params.filters && params.filters !== 'undefined') {
                    url.push('/');
                    url.push(params.filters);
                }
                done.abort();
                return helpers.common.redirect.call(this, url.join(''));
            }
            done();
        }

        function prepare(done) {
            Paginator.prepare(this.app, params, 'static');
            query = _.clone(params);
            params.categoryId = params.catId;
            params.languageId = languages._byId[this.app.session.get('selectedLanguage')].id;
            delete params.search;
            delete params.page;
            delete params.filters;

            this.app.tracking.set('keyword', query.search);
            this.app.tracking.set('page_nb', 0);

            if (!query.search || _.isEmpty(query.search.trim())) {
                this.app.seo.addMetatag('robots', 'noindex, follow');
                this.app.seo.addMetatag('googlebot', 'noindex, follow');
                done.abort();
                return callback(null, {
                    search: '',
                    meta: {
                        total: 0
                    }
                });
            }
            _.extend(params, {
                item_type: 'static',
                seo: this.app.seo.isEnabled()
            });
            done();
        }

        function fetchFeatured(done) {
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
        }

        function fetch(done, res) {
            this.app.fetch({
                items: {
                    collection: 'Items',
                    params: params
                }
            }, {
                readFromCache: false
            }, function afterFetch(err, response) {
                if (err) {
                    return done.fail(err);
                }
                if (response && res && res.featureads) {
                    res.featureads.mergeTo(response.items);
                }
                done(response);
            });
        }

        function filters(done, res) {
            var _filters;
            var filter;
            var url;

            if (!res.items) {
                return done.fail(null, {});
            }
            filter = query.filters;
            if (!filter || filter === 'undefined') {
                return done(res);
            }
            _filters = res.items.filters.format();
            if (filter !== _filters) {
                done.abort();
                _filters = (_filters ? '/' + _filters : '');
                url = [this.app.session.get('path').split('/-').shift(), _filters, URLParser.parse(this.app.session.get('url')).search || ''].join('');
                return helpers.common.redirect.call(this, url);
            }
            done(res);
        }

        function paginate(done, res) {
            var realPage;

            if (page == 1) {
                done.abort();
                return helpers.common.redirect.call(this, url);
            }
            realPage = res.items.paginate([url, '/[page][filters]'].join(''), query, {
                page: page
            });
            if (realPage) {
                done.abort();
                return helpers.common.redirect.call(this, [url, '/-p-' + realPage].join(''));
            }
            done(res.items);
        }

        function success(items) {
            var meta = items.meta;
            var location = this.app.session.get('location').url;
            var maxResultsToIndex = config.getForMarket(location, ['seo', 'maxResultToIndexFollow'], 1);
            var _category = category ? category.toJSON() : undefined;
            var _subcategory = subcategory ? subcategory.toJSON() : undefined;

            this.app.seo.setContent(meta);
            if (meta.total === 0) {
                this.app.seo.addMetatag('robots', 'noindex, nofollow');
                this.app.seo.addMetatag('googlebot', 'noindex, nofollow');
            }
            else if (meta.total <= maxResultsToIndex) {
                this.app.seo.addMetatag('robots', 'noindex, follow');
                this.app.seo.addMetatag('googlebot', 'noindex, follow');
            }

            this.app.tracking.set('keyword', query.search);
            this.app.tracking.set('page_nb', items.paginator.get('totalPages'));
            this.app.tracking.set('category', _category);
            this.app.tracking.set('subcategory', _subcategory);
            this.app.tracking.set('filters', items.filters);
            this.app.tracking.set('paginator', items.paginator);

            this.app.session.update({
                dataPage: {
                    search: query.search,
                    category: _category ? _category.id : undefined,
                    subcategory: _subcategory ? _subcategory.id : undefined
                }
            });

            callback(null, {
                items: items.toJSON(),
                meta: meta,
                filters: items.filters,
                paginator: items.paginator,
                search: query.search
            });
        }

        function fail(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }
    }
}

function allresultsig(params, callback) {
    var platform = this.app.session.get('platform');
    var gallery;
    
    if(platform === 'desktop' || platform === 'html5') {
        gallery = '-ig';
    } 
    params['f.hasimage'] = true;
    allresults.call(this, params, callback, gallery);
}

function allresults(params, callback, gallery) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var page = params ? params.page : undefined;
        var platform = this.app.session.get('platform');
        var location = this.app.session.get('location').url;
        var languages = this.app.session.get('languages');
        var url = ['/nf/all-results', gallery || ''].join('');
        var query;
        var shopsModule = new Shops(this);
        var abundance = new Abundance({}, this);

        var redirect = function(done) {
            var maxPage = config.getForMarket(location, ['ads', 'maxPage', 'allResults'], 500);
            var path = this.app.session.get('path');
            var starts = '/nf/';

            if (typeof page !== 'undefined' && !isNaN(page) && page > maxPage) {
                done.abort();
                return helpers.common.redirect.call(this, url);
            }
            if (path.slice(0, starts.length) !== starts) {
                done.abort();
                return helpers.common.redirect.call(this, ['/nf', path].join(''));
            }
            done();
        }.bind(this);

        var prepare = function(done) {
            delete params.search;

            params.seo = this.app.seo.isEnabled();
            params.abundance = true;
            params.languageId = languages._byId[this.app.session.get('selectedLanguage')].id;
            if (platform !== 'desktop') {
                params['f.hasimage'] = true;
            }

            Paginator.prepare(this.app, params);
            query = _.clone(params);

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
                if (err) {
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
            var _filters;
            var filter;
            var url;

            if (!res.items) {
                return done.fail(null, {});
            }
            filter = query.filters;
            if (!filter || filter === 'undefined') {
                return done(res);
            }
            _filters = res.items.filters.format();
            if (filter !== _filters) {
                done.abort();
                _filters = (_filters ? '/' + _filters : '');
                url = [this.app.session.get('path').split('/-').shift(), _filters, URLParser.parse(this.app.session.get('url')).search || ''].join('');
                return helpers.common.redirect.call(this, url);
            }
            done(res);
        }.bind(this);

        var paginate = function(done, res) {
            var realPage;

            if (page == 1) {
                done.abort();
                return helpers.common.redirect.call(this, url);
            }
            realPage = res.items.paginate(['/nf/all-results[page][gallery][filters]'].join(''), query, {
                page: page,
                gallery: gallery
            });
            if (realPage) {
                done.abort();
                return helpers.common.redirect.call(this, url + '-p-' + realPage);
            }
            done(res.items, res.shops);
        }.bind(this);

        var success = function(items, shops) {
            var meta = items.meta;

            this.app.seo.setContent(items.meta);
            this.app.seo.addMetatag('robots', 'noindex, nofollow');
            this.app.seo.addMetatag('googlebot', 'noindex, nofollow');

            this.app.tracking.set('page_nb', meta.totalPages);
            this.app.tracking.set('filters', items.filters);
            this.app.tracking.set('paginator', items.paginator);

            if (shopsModule.enabled()) {
                shopsModule.start("fetch-allresults", items.length, shops !== undefined ? shops.length : 0);
            }

            callback(null, {
                categories: this.dependencies.categories.toJSON(),
                items: items.toJSON(),
                shops: shops !== undefined ? shops.toJSON() : [],
                meta: meta,
                filters: items.filters,
                paginator: items.paginator
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(redirect)
            .then(prepare)
            .then(fetchFeatured)
            .then(fetch)
            .then(fetchAbundance)
            .then(filters)
            .then(paginate)
            .val(success);
    }
}
