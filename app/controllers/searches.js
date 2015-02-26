'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var URLParser = require('url');
var middlewares = require('../middlewares');
var helpers = require('../helpers');
var tracking = require('../modules/tracking');
var Paginator = require('../modules/paginator');
var FeatureAd = require('../models/feature_ad');
var config = require('../../shared/config');
var utils = require('../../shared/utils');
var ShopsAdmin = require('../modules/shopsadmin');
var config = require('../../shared/config');

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

    if (platform !== 'desktop') {
        return helpers.common.error.call(this, null, {}, callback);
    }
    params['f.hasimage'] = true;
    filter.call(this, params, callback, '-ig');
}

function filter(params, callback, gallery) {
    params.categoryId = params.catId;
    search.call(this, params, callback, gallery);
}

function searchig(params, callback) {
    var platform = this.app.session.get('platform');

    if (platform !== 'desktop' && platform !== 'html5') {
        return helpers.common.error.call(this, null, {}, callback);
    }
    params['f.hasimage'] = true;
    search.call(this, params, callback, '-ig');
}

function search(params, callback, gallery) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var page = params ? params.page : undefined;
        var platform = this.app.session.get('platform');
        var languages = this.app.session.get('languages');
        var path = this.app.session.get('path');
        var starts = '/nf';
        var query;
        var url;
        var category;
        var subcategory;

        var redirect = function(done) {
            if (!params.search || _.isEmpty(params.search.trim()) || params.search === 'undefined') {
                done.abort();
                return helpers.common.redirect.call(this, '/nf/all-results');
            }
            if (!utils.startsWith(path, starts)) {
                done.abort();
                return helpers.common.redirect.call(this, [starts, path].join(''));
            }
            done();
        }.bind(this);

        var buildUrl = function(done) {
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
        }.bind(this);

        var configure = function(done) {
            var categories = this.dependencies.categories;

            if (params.catId) {
                category = categories.search(params.catId);
                if (!category) {
                    category = categories.get(params.catId);
                    if (!category) {
                        done.abort();
                        return helpers.common.redirect.call(this, '/');
                    }
                }
                if (category.has('parentId')) {
                    subcategory = category;
                    category = categories.get(subcategory.get('parentId'));
                }
            }
            done();
        }.bind(this);

        var check = function(done) {
            var cat = '-cat-';
            var slug;
            var slugUrl;

            if (params.catId) {
                slug = helpers.common.slugToUrl((subcategory || category).toJSON());
                slugUrl = params.title + cat + params.catId;

                if (slug.indexOf(slugUrl)) {
                    done.abort();
                    return helpers.common.redirect.call(this, path.replace(slugUrl, slug));
                }
            }
            done();
        }.bind(this);

        var prepare = function(done) {
            params.seo = this.app.seo.isEnabled();
            params.abundance = true;
            params.languageId = languages._byId[this.app.session.get('selectedLanguage')].id;
            Paginator.prepare(this.app, params);
            query = _.clone(params);
            delete params.search;
            delete params.page;
            delete params.filters;

            this.app.seo.addMetatag('robots', 'noindex, nofollow');
            this.app.seo.addMetatag('googlebot', 'noindex, nofollow');

            tracking.addParam('keyword', query.search);
            tracking.addParam('page_nb', 0);

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
            var experiment = this.app.session.get('experiments').html4ShowShops;
            if (experiment && experiment.alternative != 'items') {
                collections.shops = {
                    collection: 'Shops',
                    params: params,
                };
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

        var filters = function(done, res) {
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
        }.bind(this);

        var paginate = function(done, res) {
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
        }.bind(this);

        var success = function(items, shops) {
            var _category = category ? category.toJSON() : undefined;
            var _subcategory = subcategory ? subcategory.toJSON() : undefined;

            this.app.seo.setContent(items.meta);
            if (items.meta.total < 5) {
                this.app.seo.addMetatag('robots', 'noindex, nofollow');
                this.app.seo.addMetatag('googlebot', 'noindex, nofollow');
            }

            tracking.addParam('page_nb', items.meta.totalPages);
            tracking.addParam('section', query.categoryId);
            tracking.addParam('page', page);
            tracking.addParam('category', _category);
            tracking.addParam('subcategory', _subcategory);
            tracking.addParam('filters', items.filters);
            tracking.addParam('paginator', items.paginator);

            this.app.session.update({
                dataPage: {
                    search: query.search,
                    category: _category ? _category.id : undefined,
                    subcategory: _subcategory ? _subcategory.id : undefined
                }
            });

            var shopsAdmin = new ShopsAdmin();
            if (shops) {
                shopsAdmin.setShops(shops.toJSON());
            }
            callback(null, ['searches/search', gallery.replace('-', '')].join(''), {
                items: items.toJSON(),
                shops: shops !== undefined ? shops.toJSON() : [],
                shopsAdmin: shopsAdmin,
                meta: items.meta,
                filters: items.filters,
                paginator: items.paginator,
                search: query.search,
                category: category
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(redirect)
            .then(buildUrl)
            .then(configure)
            .then(check)
            .then(prepare)
            .then(fetchFeatured)
            .then(fetch)
            .then(filters)
            .then(paginate)
            .val(success);
    }
}

function statics(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var page = params ? params.page : undefined;
        var platform = this.app.session.get('platform');
        var languages = this.app.session.get('languages');
        var url = ['/q/', params.search, (params.catId ? ['/c-', params.catId].join('') : '')].join('');
        var query;
        var category;
        var subcategory;

        var redirect = function(done) {
            if (params.search && params.search.toLowerCase() === 'gumtree' && this.app.session.get('location').url === 'www.olx.co.za') {
                done.abort();
                return helpers.common.redirect.call(this, '/q/-');
            }
            done();
        }.bind(this);

        var configure = function(done) {
            var categories = this.dependencies.categories;

            if (params.catId) {
                category = categories.search(params.catId);
                if (!category) {
                    category = categories.get(params.catId);
                    if (!category) {
                        done.abort();
                        return helpers.common.redirect.call(this, '/');
                    }
                }
                if (category.has('parentId')) {
                    subcategory = category;
                    category = categories.get(subcategory.get('parentId'));
                }
            }
            done();
        }.bind(this);

        var check = function(done) {
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
        }.bind(this);

        var prepare = function(done) {
            Paginator.prepare(this.app, params, 'static');
            query = _.clone(params);
            params.categoryId = params.catId;
            params.languageId = languages._byId[this.app.session.get('selectedLanguage')].id;
            delete params.search;
            delete params.page;
            delete params.filters;

            tracking.addParam('keyword', query.search);
            tracking.addParam('page_nb', 0);

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
            realPage = res.items.paginate([url, '/[page][filters]'].join(''), query, {
                page: page
            });
            if (realPage) {
                done.abort();
                return helpers.common.redirect.call(this, [url, '/-p-' + realPage].join(''));
            }
            done(res.items);
        }.bind(this);

        var success = function(items) {
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

            tracking.addParam('keyword', query.search);
            tracking.addParam('page_nb', items.paginator.get('totalPages'));
            tracking.addParam('category', _category);
            tracking.addParam('subcategory', _subcategory);
            tracking.addParam('filters', items.filters);
            tracking.addParam('paginator', items.paginator);

            this.app.session.update({
                dataPage: {
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
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(redirect)
            .then(configure)
            .then(check)
            .then(prepare)
            .then(fetchFeatured)
            .then(fetch)
            .then(filters)
            .then(paginate)
            .val(success);
    }
}

function allresultsig(params, callback) {
    params['f.hasimage'] = true;
    allresults.call(this, params, callback, '-ig');
}

function allresults(params, callback, gallery) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var page = params ? params.page : undefined;
        var platform = this.app.session.get('platform');
        var location = this.app.session.get('location').url;
        var siteLocation = this.app.session.get('siteLocation');
        var languages = this.app.session.get('languages');
        var url = ['/nf/all-results', gallery || ''].join('');
        var query;

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
            done(res.items);
        }.bind(this);

        var success = function(items) {
            var meta = items.meta;

            this.app.seo.setContent(items.meta);
            this.app.seo.addMetatag('robots', 'noindex, nofollow');
            this.app.seo.addMetatag('googlebot', 'noindex, nofollow');

            tracking.addParam('page_nb', meta.totalPages);
            tracking.addParam('filters', items.filters);
            tracking.addParam('paginator', items.paginator);

            callback(null, {
                categories: this.dependencies.categories.toJSON(),
                items: items.toJSON(),
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
            .then(filters)
            .then(paginate)
            .val(success);
    }
}
