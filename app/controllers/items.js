'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var URLParser = require('url');
var middlewares = require('../middlewares');
var helpers = require('../helpers');
var tracking = require('../modules/tracking');
var Paginator = require('../modules/paginator');
var config = require('../../shared/config');
var utils = require('../../shared/utils');
var Item = require('../models/item');

module.exports = {
    show: middlewares(show),
    gallery: middlewares(gallery),
    map: middlewares(map),
    reply: middlewares(reply),
    success: middlewares(success),
    searchfilterig: middlewares(searchfilterig),
    searchfilter: middlewares(searchfilter),
    searchig: middlewares(searchig),
    search: middlewares(search),
    staticSearchig: middlewares(staticSearchig),
    staticSearch: middlewares(staticSearch),
    allresults: middlewares(allresults),
    allresultsig: middlewares(allresultsig),
    favorite: middlewares(favorite),
    'delete': middlewares(deleteItem),
    filter: middlewares(filter),
    sort: middlewares(sort)
};

function show(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var user = this.app.session.get('user');
        var securityKey = params.sk;
        var itemId = params.itemId;
        var slugUrl = params.title;
        var favorite = params.favorite;
        var siteLocation = this.app.session.get('siteLocation');
        var languages = this.app.session.get('languages');
        var platform = this.app.session.get('platform');
        var anonymousItem;

        var prepare = function(done) {
            if (user) {
                params.token = user.token;
            }
            else if (typeof window !== 'undefined' && localStorage) {
                anonymousItem = localStorage.getItem('anonymousItem');
                anonymousItem = (!anonymousItem ? {} : JSON.parse(anonymousItem));
                if (securityKey) {
                    anonymousItem[itemId] = securityKey;
                    localStorage.setItem('anonymousItem', JSON.stringify(anonymousItem));
                }
                else {
                    securityKey = anonymousItem[itemId];
                }
            }
            params.id = itemId;
            params.seo = this.app.seo.isEnabled();
            params.languageId = languages._byId[this.app.session.get('selectedLanguage')].id;
            delete params.itemId;
            delete params.title;
            delete params.sk;
            done();
        }.bind(this);

        var buildItemPurged = function(properties) {
            var item = new Item(properties, {
                app: this.app
            });

            if (!item.get('id')) {
                item.set('id', item.get('itemId'));
                item.unset('itemId');
            }
            if (!item.get('location')) {
                item.set('location', this.app.session.get('location'));
            }
            if (!item.get('description')) {
                item.set('description', '');
            }
            if (!item.get('slug')) {
                item.set('slug', '/title-iid-' + item.get('id'));
            }
            if (!item.get('status')) {
                item.set('status', {
                    label: 'rejected'
                });
            }
            if (!item.get('category')) {
                item.set('category', {
                    id: item.get('categoryId'),
                    name: item.get('categoryName'),
                    parentId: item.get('parentCategoryId')
                });
                item.unset('categoryId');
                item.unset('categoryName');
                item.unset('parentCategoryId');
                item.unset('parentCategoryName');
            }
            if (!item.get('title')) {
                item.set('title', '');
            }
            return item;
        }.bind(this);

        var fetch = function(done) {
            this.app.fetch({
                item: {
                    model: 'Item',
                    params: params
                }
            }, {
                readFromCache: false
            }, function afterFetch(err, res) {
                if (!res) {
                    res = {};
                }
                if (err) {
                    if (err.status !== 422) {
                        return done.fail(err, res);
                    }
                    res.item = buildItemPurged(err.body);
                    err = null;
                }
                if (!res.item.get('status')) {
                    console.log('[OLX_DEBUG]', 'no status', res.item.get('id'));
                    return error(new Error(), res);
                }
                else if (!res.item.get('status').open && !res.item.get('status').onReview) {
                    res.item.set('purged', true);
                }
                done(res);
            }.bind(this));
        }.bind(this);

        var check = function(done, response) {
            if (!response.item) {
                return done.fail(null, {});
            }
            var slug = helpers.common.slugToUrl(response.item.toJSON());
            var protocol = this.app.session.get('protocol');
            var host = this.app.session.get('host');
            var itemLocation = response.item.getLocation().url || response.item.get('location').url;
            var url;

            if (platform === 'desktop' && itemLocation && itemLocation !== this.app.session.get('siteLocation')) {
                url = [protocol, '://', host, '/', slug].join('');

                done.abort();
                return helpers.common.redirect.call(this, url, null, {
                    pushState: false,
                    query: {
                        location: itemLocation
                    }
                });
            }
            if (!response.item.checkSlug(slug, slugUrl)) {
                slug = ('/' + slug);
                if (favorite) {
                    slug = helpers.common.params(slug, 'favorite', favorite);
                }
                done.abort();
                return helpers.common.redirect.call(this, slug);
            }
            if (response.item.get('location').url !== this.app.session.get('location').url) {
                url = [protocol, '://', platform, '.', response.item.get('location').url.replace('www.', 'm.'), '/', slug].join('');

                done.abort();
                return helpers.common.redirect.call(this, url, null, {
                    pushState: false,
                    query: {
                        location: itemLocation
                    }
                });
            }
            done(response.item);
        }.bind(this);

        var fetchRelateds = function(done, item) {
            this.app.fetch({
                relatedItems: {
                    collection : 'Items',
                    params: {
                        location: siteLocation,
                        offset: 0,
                        pageSize: 10,
                        relatedAds: itemId
                    }
                }
            }, {
                readFromCache: false
            }, function afterFetch(err, response) {
                if (err) {
                    err = null;
                    response = {
                        relatedItems: []
                    };
                }
                else {
                    response.relatedItems = response.relatedItems.toJSON();
                }
                done(item, response.relatedItems);
            }.bind(this));
        }.bind(this);

        var success = function(_item, relatedItems) {
            var item = _item.toJSON();
            var subcategory = this.dependencies.categories.search(_item.get('category').id);
            var view = 'items/show';
            var category;
            var url;

            if (!subcategory) {
                item.purged = true;
            }
            else {
                category = subcategory;
                if (subcategory.has('parentId')) {
                    category = this.dependencies.categories.get(subcategory.get('parentId'));
                }
            }
            subcategory = (subcategory ? subcategory.toJSON() : undefined);
            category = (category ? category.toJSON() : undefined);
            this.app.seo.setContent(item.metadata);
            if (!item.purged) {
                this.app.seo.addMetatag('title', item.title);
                this.app.seo.set('altImages', item);
            }
            else {
                this.app.seo.addMetatag('robots', 'noindex, nofollow');
                this.app.seo.addMetatag('googlebot', 'noindex, nofollow');
            }

            if (platform !== 'desktop' && siteLocation && !~siteLocation.indexOf('www.')) {
                url = helpers.common.removeParams(this.app.session.get('url'), 'location');
                this.app.seo.addMetatag('canonical', helpers.common.fullizeUrl(url, this.app));
            }
            tracking.addParam('item', item);
            tracking.addParam('category', category);
            tracking.addParam('subcategory', subcategory);
            this.app.session.update({
                postingLink: {
                    category: (category ? category.id : undefined),
                    subcategory: (subcategory ? subcategory.id : undefined)
                }
            });

            if (item.purged) {
                view = 'items/unavailable';
            }
            else if (item.status.deprecated) {
                view = 'items/expired';
            }

            callback(null, view, {
                item: item,
                pos: Number(params.pos) || 0,
                sk: securityKey,
                relatedItems: relatedItems || [],
                relatedAdsLink: (subcategory ? ['/', helpers.common.slugToUrl(subcategory), '?relatedAds=', itemId].join('') : undefined),
                subcategory: subcategory,
                category: category,
                favorite: favorite,
                categories: this.dependencies.categories.toJSON()
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(prepare)
            .then(fetch)
            .then(check)
            .then(fetchRelateds)
            .val(success);
    }
}

function gallery(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var user = this.app.session.get('user');
        var itemId = params.itemId;
        var slugUrl = params.title;
        var pos = Number(params.pos) || 0;
        var siteLocation = this.app.session.get('siteLocation');

        var redirect = function(done) {
            var platform = this.app.session.get('platform');

            if (platform === 'desktop') {
                return done.fail();
            }
            done();
        }.bind(this);

        var prepare = function(done) {
            if (user) {
                params.token = user.token;
            }
            params.id = params.itemId;
            delete params.itemId;
            delete params.title;
            done();
        }.bind(this);

        var fetch = function(done) {
            this.app.fetch({
                item: {
                    model: 'Item',
                    params: params
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var check = function(done, res) {
            if (!res.item) {
                return done.fail(null, {});
            }
            var item = res.item.toJSON();
            var slug = helpers.common.slugToUrl(item);
            var platform = this.app.session.get('platform');

            if (platform !== 'html4') {
                done.abort();
                return helpers.common.redirect.call(this, ('/' + slug));
            }
            if (!res.item.checkSlug(slug, slugUrl)) {
                done.abort();
                return helpers.common.redirect.call(this, ('/' + slug));
            }
            if (!item.images || !item.images.length) {
                done.abort();
                return helpers.common.redirect.call(this, ('/' + slug));
            }
            if (pos < 0 || pos >= item.images.length) {
                done.abort();
                return helpers.common.redirect.call(this, ('/' + slug + '/gallery'));
            }
            done(res.item);
        }.bind(this);

        var success = function(_item) {
            var item = _item.toJSON();
            var subcategory = this.dependencies.categories.search(_item.get('category').id);
            var category;

            if (!subcategory) {
                return error();
            }
            category = subcategory;
            if (subcategory.has('parentId')) {
                category = this.dependencies.categories.get(subcategory.get('parentId'));
            }

            tracking.addParam('item', item);
            tracking.addParam('category', category.toJSON());
            tracking.addParam('subcategory', subcategory.toJSON());

            callback(null, {
                item: item,
                pos: pos
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(redirect)
            .then(prepare)
            .then(fetch)
            .then(check)
            .val(success);
    }
}

function map(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var user = this.app.session.get('user');
        var itemId = params.itemId;
        var slugUrl = params.title;
        var siteLocation = this.app.session.get('siteLocation');

        var redirect = function(done) {
            var platform = this.app.session.get('platform');

            if (platform === 'desktop') {
                return done.fail();
            }
            done();
        }.bind(this);

        var prepare = function(done) {
            if (user) {
                params.token = user.token;
            }
            params.id = params.itemId;
            delete params.itemId;
            delete params.title;
            done();
        }.bind(this);

        var findItem = function(done) {
            this.app.fetch({
                item: {
                    model: 'Item',
                    params: params
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var checkItem = function(done, resItem) {
            if (!resItem.item) {
                return done.fail(null, {});
            }
            var item = resItem.item.toJSON();
            var slug = helpers.common.slugToUrl(item);
            var platform = this.app.session.get('platform');

            if (platform !== 'html4') {
                done.abort();
                return helpers.common.redirect.call(this, ('/' + slug));
            }
            if (!resItem.item.checkSlug(slug, slugUrl)) {
                done.abort();
                return helpers.common.redirect.call(this, ('/' + slug));
            }
            done(resItem.item);
        }.bind(this);

        var success = function(_item) {
            var item = _item.toJSON();
            var subcategory = this.dependencies.categories.search(_item.get('category').id);
            var category;
            var parentId;

            if (!subcategory) {
                return error();
            }
            parentId = subcategory.get('parentId');
            category = parentId ? this.dependencies.categories.get(parentId) : subcategory;

            tracking.addParam('item', _item.toJSON());
            tracking.addParam('category', category.toJSON());
            tracking.addParam('subcategory', subcategory.toJSON());
            callback(null, {
                item: _item.toJSON()
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(redirect)
            .then(prepare)
            .then(findItem)
            .then(checkItem)
            .val(success);
    }
}

function reply(params, callback) {
    helpers.controllers.control.call(this, params, {
        isForm: true
    }, controller);

    function controller() {
        var itemId = params.itemId;
        var siteLocation = this.app.session.get('siteLocation');

        var redirect = function(done) {
            var platform = this.app.session.get('platform');

            if (platform === 'html5' || platform === 'desktop') {
                return done.fail();
            }
            done();
        }.bind(this);

        var prepare = function(done) {
            params.id = params.itemId;
            delete params.itemId;
            done();
        }.bind(this);

        var findItem = function(done) {
            this.app.fetch({
                item: {
                    model: 'Item',
                    params: params
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var checkItem = function(done, resItem) {
            if (!resItem.item) {
                return done.fail(null, {});
            }
            var platform = this.app.session.get('platform');

            if (platform === 'html5' || platform === 'desktop') {
                return done.fail();
            }
            done(resItem.item);
        }.bind(this);

        var success = function(_item) {
            var item = _item.toJSON();
            var subcategory = this.dependencies.categories.search(item.category.id);
            var category;
            var parentId;

            if (!subcategory) {
                return error();
            }
            parentId = subcategory.get('parentId');
            category = parentId ? this.dependencies.categories.get(parentId) : subcategory;

            this.app.seo.addMetatag('robots', 'noindex, nofollow');
            this.app.seo.addMetatag('googlebot', 'noindex, nofollow');

            tracking.addParam('item', item);
            tracking.addParam('category', category.toJSON());
            tracking.addParam('subcategory', subcategory.toJSON());

            callback(null, {
                item: item,
                form: this.form
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(redirect)
            .then(prepare)
            .then(findItem)
            .then(checkItem)
            .val(success);
    }
}

function success(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var itemId = params.itemId;
        var siteLocation = this.app.session.get('siteLocation');

        var prepare = function(done) {
            params.id = params.itemId;
            delete params.itemId;
            done();
        }.bind(this);

        var findItem = function(done) {
            this.app.fetch({
                item: {
                    model: 'Item',
                    params: params
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var checkItem = function(done, resItem) {
            if (!resItem.item) {
                return done.fail(null, {});
            }
            done(resItem.item);
        }.bind(this);

        var success = function(_item) {
            var item = _item.toJSON();
            var subcategory = this.dependencies.categories.search(item.category.id);
            var category;
            var parentId;

            if (!subcategory) {
                return error();
            }
            parentId = subcategory.get('parentId');
            category = parentId ? this.dependencies.categories.get(parentId) : subcategory;

            tracking.addParam('item', item);
            tracking.addParam('category', category.toJSON());
            tracking.addParam('subcategory', subcategory.toJSON());

            callback(null, {
                item: item
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(prepare)
            .then(findItem)
            .then(checkItem)
            .val(success);
    }
}

function searchfilterig(params, callback) {
    var platform = this.app.session.get('platform');

    if (platform !== 'desktop') {
        return helpers.common.error.call(this, null, {}, callback);
    }
    params['f.hasimage'] = true;
    searchfilter.call(this, params, callback, '-ig');
}

function searchfilter(params, callback, gallery) {
    params.categoryId = params.catId;
    search.call(this, params, callback, gallery);
}

function searchig(params, callback) {
    var platform = this.app.session.get('platform');

    if (platform !== 'desktop') {
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
                if (platform === 'desktop') {
                    return helpers.common.redirect.call(this, '/nf/all-results');
                }
                return callback(null, {
                    search: '',
                    meta: {
                        total: 0
                    }
                });
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

            if (params.categoryId) {
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

        var prepare = function(done) {
            params.seo = this.app.seo.isEnabled();
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
            done(res.items);
        }.bind(this);

        var success = function(items) {
            this.app.seo.setContent(items.meta);
            if (items.meta.total < 5) {
                this.app.seo.addMetatag('robots', 'noindex, nofollow');
                this.app.seo.addMetatag('googlebot', 'noindex, nofollow');
            }

            tracking.addParam('page_nb', items.meta.totalPages);
            tracking.addParam('section', query.categoryId);
            tracking.addParam('page', page);
            tracking.addParam('category', category ? category.toJSON() : undefined);
            tracking.addParam('subcategory', subcategory ? subcategory.toJSON() : undefined);

            callback(null, ['items/search', gallery.replace('-', '')].join(''), {
                items: items.toJSON(),
                meta: items.meta,
                filters: items.filters,
                paginator: items.paginator,
                search: query.search,
                category: category ? category.toJSON() : undefined
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(redirect)
            .then(buildUrl)
            .then(configure)
            .then(prepare)
            .then(fetch)
            .then(filters)
            .then(paginate)
            .val(success);
    }
}

function staticSearchig(params, callback) {
    params['f.hasimage'] = true;
    staticSearch.call(this, params, callback, '-ig');
}

function staticSearch(params, callback, gallery) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var page = params ? params.page : undefined;
        var platform = this.app.session.get('platform');
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

        var prepare = function(done) {
            Paginator.prepare(this.app, params);
            query = _.clone(params);
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
            done();
        }.bind(this);

        var findItems = function(done) {
            this.app.fetch({
                items: {
                    collection: 'Items',
                    params: _.extend(params, {
                        item_type: 'staticSearch',
                        seo: this.app.seo.isEnabled()
                    })
                }
            }, {
                readFromCache: false
            }, done.errfcb);
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
                return helpers.common.redirect.call(this, [url, (gallery ? '/' + gallery : '')].join(''));
            }
            realPage = res.items.paginate([url, '/[page][gallery][filters]'].join(''), query, {
                page: page,
                gallery: gallery
            });
            if (realPage) {
                done.abort();
                return helpers.common.redirect.call(this, [url, '/-p-' + realPage, (gallery ? gallery : '')].join(''));
            }
            done(res.items);
        }.bind(this);

        var success = function(items) {
            var meta = items.meta;

            this.app.seo.setContent(meta);

            if (meta.total <= 1) {
                this.app.seo.addMetatag('robots', 'noindex, follow');
                this.app.seo.addMetatag('googlebot', 'noindex, follow');
            }
            if (meta.total === 0) {
                this.app.seo.addMetatag('robots', 'noindex, nofollow');
                this.app.seo.addMetatag('googlebot', 'noindex, nofollow');
            }

            tracking.addParam('keyword', query.search);
            tracking.addParam('page_nb', items.paginator.get('totalPages'));
            tracking.addParam('category', category ? category.toJSON() : undefined);
            tracking.addParam('subcategory', subcategory ? subcategory.toJSON() : undefined);

            callback(null, ['items/staticsearch', (gallery || '').replace('-', '')].join(''), {
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
            .then(prepare)
            .then(findItems)
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

            if (platform !== 'desktop') {
                return done.fail();
            }
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
            params.languageId = languages._byId[this.app.session.get('selectedLanguage')].id;
            Paginator.prepare(this.app, params);
            query = _.clone(params);

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
            .then(fetch)
            .then(filters)
            .then(paginate)
            .val(success);
    }
}

function favorite(params, callback) {
    var user;
    var intent;

    var prepare = function(done) {
        var platform = this.app.session.get('platform');
        var url;

        if (platform === 'wap') {
            done.abort();
            return helpers.common.redirect.call(this, '/');
        }
        user = this.app.session.get('user');
        if (!user) {
            url = helpers.common.params('/login', 'redirect', (params.redirect || '/des-iid-' + params.itemId));

            done.abort();
            return helpers.common.redirect.call(this, url, null, {
                status: 302
            });
        }
        intent = !params.intent || params.intent === 'undefined' ? undefined : params.intent;
        done();
    }.bind(this);

    var add = function(done) {
        helpers.dataAdapter.post(this.app.req, '/users/' + user.userId + '/favorites/' + params.itemId + (intent ? '/' + intent : ''), {
            query: {
                token: user.token,
                platform: this.app.session.get('platform')
            }
        }, done.errfcb);
    }.bind(this);

    var success = function() {
        var url = (params.redirect || '/des-iid-' + params.itemId);

        url = helpers.common.params(url, 'favorite', (intent || 'add'));
        helpers.common.redirect.call(this, url, null, {
            status: 302
        });
    }.bind(this);

    var error = function() {
        helpers.common.redirect.call(this, params.redirect || '/des-iid-' + params.itemId, null, {
            status: 302
        });
    }.bind(this);

    asynquence().or(error)
        .then(prepare)
        .then(add)
        .val(success);
}

function deleteItem(params, callback) {
    var user;
    var itemId;

    var prepare = function(done) {
        var platform = this.app.session.get('platform');

        if (platform === 'wap') {
            done.abort();
            return helpers.common.redirect.call(this, '/');
        }
        user = this.app.session.get('user');
        if (!user) {
            done.abort();
            return helpers.common.redirect.call(this, '/login', null, {
                status: 302
            });
        }
        itemId = !params.itemId || params.itemId === 'undefined' ? undefined : params.itemId;
        done();
    }.bind(this);

    var remove = function(done) {
        helpers.dataAdapter.post(this.app.req, ('/items/' + itemId + '/delete'), {
            query: {
                token: user.token,
                platform: this.app.session.get('platform')
            }
        }, done.errfcb);
    }.bind(this);

    var success = function() {
        helpers.common.redirect.call(this, '/myolx/myadslisting?deleted=true', null, {
            status: 302
        });
    }.bind(this);

    var error = function() {
        helpers.common.redirect.call(this, '/myolx/myadslisting', null, {
            status: 302
        });
    }.bind(this);

    asynquence().or(error)
        .then(prepare)
        .then(remove)
        .val(success);
}

function filter(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var platform = this.app.session.get('platform');

        var redirect = function(done) {
            if (platform !== 'html5') {
                done.abort();
                return helpers.common.redirect.call(this, this.app.session.get('url').replace('/filter', ''));
            }
            done();
        }.bind(this);

        var prepare = function(done) {
            params.location = this.app.session.get('siteLocation');
            params.offset = 0;
            params.pageSize = 0;
            params.languageId = this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id;

            if (params.search) {
                params.searchTerm = params.search;
                delete params.search;
            }
            if (params.catId) {
                params.categoryId = params.catId;
                delete params.catId;
            }
            if (params.title) {
                delete params.title;
            }
            delete params.platform;
            delete params.page;
            delete params.filters;
            done();
        }.bind(this);

        var find = function(done) {
            this.app.fetch({
                items: {
                    collection: 'Items',
                    params: params
                }
            }, {
                readFromCache: false
            }, function afterFetch(err, res) {
                done(res.items.filters);
            }.bind(this));
        }.bind(this);

        var success = function(filters) {
            this.app.seo.addMetatag('robots', 'noindex, nofollow');
            this.app.seo.addMetatag('googlebot', 'noindex, nofollow');
            callback(null, 'items/filter', {
                filters: filters
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(redirect)
            .then(prepare)
            .then(find)
            .val(success);
    }
}

function sort(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var platform = this.app.session.get('platform');

        var redirect = function(done) {
            if (platform !== 'html5') {
                done.abort();
                return helpers.common.redirect.call(this, this.app.session.get('url').replace('/sort', ''));
            }
            done();
        }.bind(this);

        var build = function(done) {
            var options = [
                {
                    name: 'pricedesc'
                },
                {
                    name: 'price'
                },
                {
                    name: 'datedesc'
                }
            ];

            done(options);
        }.bind(this);

        var success = function(options) {
            this.app.seo.addMetatag('robots', 'noindex, nofollow');
            this.app.seo.addMetatag('googlebot', 'noindex, nofollow');
            callback(null, 'items/sort', {
                sorts: options
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(redirect)
            .then(build)
            .val(success);
    }
}
