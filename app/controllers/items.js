'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var middlewares = require('../middlewares');
var helpers = require('../helpers');
var Seo = require('../modules/seo');
var tracking = require('../modules/tracking');
var config = require('../../shared/config');
var Item = require('../models/item');

module.exports = {
    show: middlewares(show),
    gallery: middlewares(gallery),
    map: middlewares(map),
    reply: middlewares(reply),
    success: middlewares(success),
    search: middlewares(search),
    searchig: middlewares(searchig),
    searchfilter: middlewares(searchfilter),
    searchfilterig: middlewares(searchfilterig),
    allresults: middlewares(allresults),
    allresultsig: middlewares(allresultsig),
    favorite: middlewares(favorite),
    'delete': middlewares(deleteItem),
    staticSearch: middlewares(staticSearch)
};

function show(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var seo = Seo.instance(this.app);
        var user = this.app.session.get('user');
        var securityKey = params.sk;
        var itemId = params.itemId;
        var slugUrl = params.title;
        var favorite = params.favorite;
        var siteLocation = this.app.session.get('siteLocation');
        var languages = this.app.session.get('languages');
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
            params.seo = seo.isEnabled();
            params.languageId = languages._byId[this.app.session.get('selectedLanguage')].id;
            delete params.itemId;
            delete params.title;
            delete params.sk;
            done();
        }.bind(this);

        var findCategories = function(done) {
            this.app.fetch({
                categories: {
                    collection : 'Categories',
                    params: {
                        location: siteLocation,
                        languageId: params.languageId
                    }
                }
            }, {
                readFromCache: false
            }, done.errfcb);
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

        var findItem = function(done) {
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

        var checkItem = function(done, resCategories, resItem) {
            if (!resCategories.categories || !resItem.item) {
                return done.fail(null, {});
            }
            var item = resItem.item.toJSON();
            var slug = helpers.common.slugToUrl(item);
            var protocol = this.app.session.get('protocol');
            var platform = this.app.session.get('platform');
            var url;

            if (!resItem.item.checkSlug(slug, slugUrl)) {
                slug = ('/' + slug);
                if (favorite) {
                    slug = helpers.common.params(slug, 'favorite', favorite);
                }
                done.abort();
                return helpers.common.redirect.call(this, slug);
            }
            if (item.location.url !== this.app.session.get('location').url) {
                url = [protocol, '://', platform, '.', item.location.url.replace('www.', 'm.'), '/', slug].join('');

                done.abort();
                return helpers.common.redirect.call(this, url, null, {
                    pushState: false,
                    query: {
                        location: resItem.item.getLocation().url
                    }
                });
            }

            done(resCategories.categories, resItem.item);
        }.bind(this);

        var findRelatedItems = function(done, _categories, _item) {
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
            }, function afterFetch(err, res) {
                if (err) {
                    err = null;
                    res = {
                        relatedItems: []
                    };
                }
                else {
                    res.relatedItems = res.relatedItems.toJSON();
                }
                done(_categories, _item, res.relatedItems);
            }.bind(this));
        }.bind(this);

        var success = function(_categories, _item, _relatedItems) {
            var item = _item.toJSON();
            var subcategory = _categories.search(_item.get('category').id);
            var view = 'items/show';
            var category;
            var parentId;
            var url;
            var title;
            var description;

            seo.setContent(item.metadata.seo);
            if(item.metadata.itemPage.h1) {
                seo.set('extendedTitle',item.metadata.itemPage.h1);
            }
            if (!subcategory) {
                _item.set('purged', true);
                item = _item.toJSON();
            }
            else {
                parentId = subcategory.get('parentId');
                category = parentId ? _categories.get(parentId) : subcategory;
            }
            subcategory = (subcategory ? subcategory.toJSON() : undefined);
            category = (category ? category.toJSON() : undefined);

            tracking.addParam('item', item);
            tracking.addParam('category', category);
            tracking.addParam('subcategory', subcategory);
            if (!item.purged) {
                title = item.title;
                if (item.metadata && item.metadata.itemPage) {
                    title = item.metadata.itemPage.title;
                    description = item.metadata.itemPage.description;
                }
                seo.addMetatag('title', title);
                seo.addMetatag('description', description);
            }
            else {
                seo.addMetatag('robots', 'noindex, nofollow');
                seo.addMetatag('googlebot', 'noindex, nofollow');
            }
            if (siteLocation && !~siteLocation.indexOf('www.')) {
                url = helpers.common.removeParams(this.app.session.get('url'), 'location');
                seo.addMetatag('canonical', helpers.common.fullizeUrl(url, this.app));
            }
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
                seo: seo,
                pos: Number(params.pos) || 0,
                sk: securityKey,
                relatedItems: _relatedItems || [],
                relatedAdsLink: (subcategory ? ['/', helpers.common.slugToUrl(subcategory), '?relatedAds=', itemId].join('') : undefined),
                subcategory: subcategory,
                category: category,
                favorite: favorite,
                tracking: tracking.generateURL.call(this),
                categories: _categories.toJSON()
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(prepare)
            .gate(findCategories, findItem)
            .then(checkItem)
            .then(findRelatedItems)
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

        var prepare = function(done) {
            if (user) {
                params.token = user.token;
            }
            params.id = params.itemId;
            delete params.itemId;
            delete params.title;
            done();
        }.bind(this);

        var findCategories = function(done) {
            this.app.fetch({
                categories: {
                    collection : 'Categories',
                    params: {
                        location: siteLocation,
                        languageCode: this.app.session.get('selectedLanguage')
                    }
                }
            }, {
                readFromCache: false
            }, done.errfcb);
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

        var checkItem = function(done, resCategories, resItem) {
            if (!resCategories.categories || !resItem.item) {
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
            if (!item.images || !item.images.length) {
                done.abort();
                return helpers.common.redirect.call(this, ('/' + slug));
            }
            if (pos < 0 || pos >= item.images.length) {
                done.abort();
                return helpers.common.redirect.call(this, ('/' + slug + '/gallery'));
            }
            done(resCategories.categories, resItem.item);
        }.bind(this);

        var success = function(_categories, _item) {
            var item = _item.toJSON();
            var subcategory = _categories.search(_item.get('category').id);
            var category;
            var parentId;

            if (!subcategory) {
                return error();
            }
            parentId = subcategory.get('parentId');
            category = parentId ? _categories.get(parentId) : subcategory;

            tracking.addParam('item', item);
            tracking.addParam('category', category.toJSON());
            tracking.addParam('subcategory', subcategory.toJSON());
            callback(null, {
                item: item,
                pos: pos,
                tracking: tracking.generateURL.call(this)
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(prepare)
            .gate(findCategories, findItem)
            .then(checkItem)
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

        var prepare = function(done) {
            if (user) {
                params.token = user.token;
            }
            params.id = params.itemId;
            delete params.itemId;
            delete params.title;
            done();
        }.bind(this);

        var findCategories = function(done) {
            this.app.fetch({
                categories: {
                    collection : 'Categories',
                    params: {
                        location: siteLocation,
                        languageCode: this.app.session.get('selectedLanguage')
                    }
                }
            }, {
                readFromCache: false
            }, done.errfcb);
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

        var checkItem = function(done, resCategories, resItem) {
            if (!resCategories.categories || !resItem.item) {
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
            done(resCategories.categories, resItem.item);
        }.bind(this);

        var success = function(_categories, _item) {
            var item = _item.toJSON();
            var subcategory = _categories.search(_item.get('category').id);
            var category;
            var parentId;

            if (!subcategory) {
                return error();
            }
            parentId = subcategory.get('parentId');
            category = parentId ? _categories.get(parentId) : subcategory;

            tracking.addParam('item', _item.toJSON());
            tracking.addParam('category', category.toJSON());
            tracking.addParam('subcategory', subcategory.toJSON());
            callback(null, {
                item: _item.toJSON(),
                tracking: tracking.generateURL.call(this)
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(prepare)
            .gate(findCategories, findItem)
            .then(checkItem)
            .val(success);
    }
}

function reply(params, callback) {
    helpers.controllers.control.call(this, params, {
        isForm: true
    }, controller);

    function controller(form) {
        var seo = Seo.instance(this.app);
        var itemId = params.itemId;
        var siteLocation = this.app.session.get('siteLocation');

        var prepare = function(done) {
            params.id = params.itemId;
            delete params.itemId;
            done();
        }.bind(this);

        var findCategories = function(done) {
            this.app.fetch({
                categories: {
                    collection : 'Categories',
                    params: {
                        location: siteLocation,
                        languageCode: this.app.session.get('selectedLanguage')
                    }
                }
            }, {
                readFromCache: false
            }, done.errfcb);
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

        var checkItem = function(done, resCategories, resItem) {
            if (!resCategories.categories || !resItem.item) {
                return done.fail(null, {});
            }
            var item = resItem.item.toJSON();
            var platform = this.app.session.get('platform');

            if (platform === 'html5') {
                done.abort();
                return helpers.common.redirect.call(this, ['/', params.title, (params.title || '-'), 'iid-', item.id]);
            }
            done(resCategories.categories, resItem.item);
        }.bind(this);

        var success = function(_categories, _item) {
            var item = _item.toJSON();
            var subcategory = _categories.search(item.category.id);
            var category;
            var parentId;

            if (!subcategory) {
                return error();
            }
            parentId = subcategory.get('parentId');
            category = parentId ? _categories.get(parentId) : subcategory;

            seo.addMetatag('robots', 'noindex, nofollow');
            seo.addMetatag('googlebot', 'noindex, nofollow');

            tracking.addParam('item', item);
            tracking.addParam('category', category.toJSON());
            tracking.addParam('subcategory', subcategory.toJSON());

            callback(null, {
                item: item,
                form: form,
                tracking: tracking.generateURL.call(this)
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(prepare)
            .gate(findCategories, findItem)
            .then(checkItem)
            .val(success);
    }
}

function success(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var seo = Seo.instance(this.app);
        var itemId = params.itemId;
        var siteLocation = this.app.session.get('siteLocation');

        var prepare = function(done) {
            params.id = params.itemId;
            delete params.itemId;
            done();
        }.bind(this);

        var findCategories = function(done) {
            this.app.fetch({
                categories: {
                    collection : 'Categories',
                    params: {
                        location: siteLocation,
                        languageCode: this.app.session.get('selectedLanguage')
                    }
                }
            }, {
                readFromCache: false
            }, done.errfcb);
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

        var checkItem = function(done, resCategories, resItem) {
            if (!resCategories.categories || !resItem.item) {
                return done.fail(null, {});
            }
            done(resCategories.categories, resItem.item);
        }.bind(this);

        var success = function(_categories, _item) {
            var item = _item.toJSON();
            var subcategory = _categories.search(item.category.id);
            var category;
            var parentId;

            if (!subcategory) {
                return error();
            }
            parentId = subcategory.get('parentId');
            category = parentId ? _categories.get(parentId) : subcategory;

            tracking.addParam('item', item);
            tracking.addParam('category', category.toJSON());
            tracking.addParam('subcategory', subcategory.toJSON());

            callback(null, {
                item: item,
                tracking: tracking.generateURL.call(this)
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(prepare)
            .gate(findCategories, findItem)
            .then(checkItem)
            .val(success);
    }
}

function searchfilterig(params, callback) {
    params['f.hasimage'] = true;
    searchfilter.call(this, params, callback, '-ig');
}

function searchfilter(params, callback, isGallery) {
    params.categoryId = params.catId;
    search.call(this, params, callback, isGallery);
}

function searchig(params, callback) {
    params['f.hasimage'] = true;
    search.call(this, params, callback, '-ig');
}

function search(params, callback, isGallery) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var seo = Seo.instance(this.app);
        var page = params ? params.page : undefined;
        var infiniteScroll = config.get('infiniteScroll', false);
        var platform = this.app.session.get('platform');
        var query;
        var url;

        var configute = function(done) {
            url = ['/nf/'];

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

        var prepare = function(done) {
            if (platform === 'html5' && infiniteScroll && (typeof page !== 'undefined' && !isNaN(page) && page > 1)) {
                done.abort();
                return helpers.common.redirect.call(this, [url, '/', isGallery || ''].join(''));
            }
            helpers.pagination.prepare(this.app, params);
            query = _.clone(params);
            delete params.search;
            delete params.page;
            delete params.filters;
            delete params.urlFilters;

            seo.addMetatag('robots', 'noindex, nofollow');
            seo.addMetatag('googlebot', 'noindex, nofollow');

            tracking.addParam('keyword', query.search);
            tracking.addParam('page_nb', 0);

            done();
        }.bind(this);

        var redirect = function(done) {
            if (!query.search || _.isEmpty(query.search.trim())) {
                done.abort();
                if (platform === 'desktop') {
                    return helpers.common.redirect.call(this, '/nf/all-results');
                }
                return callback(null, {
                    search: '',
                    metadata: {
                        total: 0
                    },
                    tracking: tracking.generateURL.call(this)
                });
            }
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

            if (!res.items) {
                return done.fail(null, {});
            }
            if (page == 1) {
                done.abort();
                return helpers.common.redirect.call(this, [url, '/', isGallery || ''].join(''));
            }
            realPage = res.items.paginate(page, query, [url, '/'].join(''), isGallery);
            if (realPage) {
                done.abort();
                return helpers.common.redirect.call(this, [url, '/-p-', realPage, isGallery || ''].join(''));
            }
            done(res.items);
        }.bind(this);

        var success = function(items) {
            var metadata = items.metadata;

            if (metadata.total < 5) {
                seo.addMetatag('robots', 'noindex, nofollow');
                seo.addMetatag('googlebot', 'noindex, nofollow');
            }
            seo.addMetatag('title', query.search + (metadata.page > 1 ? (' - ' + metadata.page) : ''));
            seo.addMetatag('description');

            tracking.addParam('page_nb', metadata.totalPages);
            tracking.addParam('section', query.categoryId);
            tracking.addParam('page', page);

            callback(null, ['items/search', (isGallery || '').replace('-', '')].join(''), {
                items: items.toJSON(),
                metadata: metadata,
                search: query.search,
                infiniteScroll: infiniteScroll,
                tracking: tracking.generateURL.call(this)
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(configute)
            .then(prepare)
            .then(redirect)
            .then(fetch)
            .then(paginate)
            .val(success);
    }
}

function allresultsig(params, callback) {
    params['f.hasimage'] = true;
    allresults.call(this, params, callback, '-ig');
}

function allresults(params, callback, isGallery) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var seo = Seo.instance(this.app);
        var page = params ? params.page : undefined;
        var infiniteScroll = config.get('infiniteScroll', false);
        var platform = this.app.session.get('platform');
        var location = this.app.session.get('location').url;
        var siteLocation = this.app.session.get('siteLocation');
        var url = ['/nf/all-results', isGallery || ''].join('');
        var query;

        var redirect = function(done) {
            if (page !== undefined && !isNaN(page) && page > 1 &&
                (page > config.getForMarket(location, ['ads', 'maxPage', 'allResults'], 500) ||
                 (platform === 'html5' && infiniteScroll))) {
                done.abort();
                return helpers.common.redirect.call(this, url);
            }
            done();
        }.bind(this);

        var prepare = function(done) {
            delete params.search;

            params.seo = seo.isEnabled();
            helpers.pagination.prepare(this.app, params);
            query = _.clone(params);

            delete params.page;
            delete params.filters;
            delete params.urlFilters;

            done();
        }.bind(this);

        var fetch = function(done) {
            this.app.fetch({
                categories: {
                    collection : 'Categories',
                    params: {
                        location: siteLocation,
                        languageCode: this.app.session.get('selectedLanguage')
                    }
                },
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
                return helpers.common.redirect.call(this, url);
            }
            realPage = res.items.paginate(page, query, url);
            if (realPage) {
                done.abort();
                return helpers.common.redirect.call(this, url + '-p-' + realPage);
            }
            done(res.categories, res.items);
        }.bind(this);

        var success = function(_categories, _items) {
            var metadata = _items.metadata;

            seo.addMetatag('robots', 'noindex, nofollow');
            seo.addMetatag('googlebot', 'noindex, nofollow');
            seo.addMetatag('title', 'all-results' + (metadata.page > 1 ? (' - ' + metadata.page) : ''));
            seo.addMetatag('description');

            tracking.addParam('page_nb', metadata.totalPages);

            callback(null, {
                categories: _categories.toJSON(),
                items: _items.toJSON(),
                metadata: metadata,
                infiniteScroll: infiniteScroll,
                tracking: tracking.generateURL.call(this)
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(redirect)
            .then(prepare)
            .then(fetch)
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

function staticSearch(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var seo = Seo.instance(this.app);
        var page = params ? params.page : undefined;
        var infiniteScroll = config.get('infiniteScroll', false);
        var platform = this.app.session.get('platform');
        var query;

        var redirect = function(done) {
            if (platform !== 'desktop') {
                done.abort();
                return helpers.common.redirect.call(this, '/');
            }
            if (params.search && params.search.toLowerCase() === 'gumtree' && this.app.session.get('location').url === 'www.olx.co.za') {
                done.abort();
                return helpers.common.redirect.call(this, '/q/-');
            }
            done();
        }.bind(this);

        var prepare = function(done) {
            helpers.pagination.prepare(this.app, params);
            query = _.clone(params);
            delete params.search;
            delete params.page;
            delete params.filters;
            delete params.urlFilters;

            tracking.addParam('keyword', query.search);
            tracking.addParam('page_nb', 0);

            if (!query.search || _.isEmpty(query.search.trim())) {
                seo.addMetatag('robots', 'noindex, follow');
                seo.addMetatag('googlebot', 'noindex, follow');
                done.abort();
                return callback(null, {
                    search: '',
                    metadata: {
                        total: 0
                    },
                    tracking: tracking.generateURL.call(this)
                });
            }
            done();
        }.bind(this);

        var findItems = function(done) {
            params.item_type = 'staticSearch';
            params.seo = seo.isEnabled();
            this.app.fetch({
                items: {
                    collection: 'Items',
                    params: params
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var checkSearch = function(done, res) {
            if (!res.items) {
                return done.fail(null, {});
            }

            if (typeof page !== 'undefined' && (isNaN(page) || page <= 1 || page >= 999999  || !res.items.length)) {
                done.abort();
                return helpers.common.redirect.call(this, '/');
            }
            done(res.items);
        }.bind(this);

        var success = function(_items) {
            var url = ['/q/', query.search, '/c-', params.catId ,  '/'].join('');
            var metadata = _items.metadata;

            helpers.pagination.paginate(metadata, query, url);

            seo.setContent(_items.metadata.seo);
            if (metadata.total < 5) {
                seo.addMetatag('robots', 'noindex, follow');
                seo.addMetatag('googlebot', 'noindex, follow');
            }
            seo.addMetatag('title', query.search + (metadata.page > 1 ? (' - ' + metadata.page) : ''));
            seo.addMetatag('description');

            tracking.addParam('page_nb', metadata.totalPages);

            callback(null, 'items/staticsearch', {
                items: _items.toJSON(),
                metadata: metadata,
                search: query.search,
                infiniteScroll: infiniteScroll,
                tracking: tracking.generateURL.call(this),
                seo: seo
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(redirect)
            .then(prepare)
            .then(findItems)
            .then(checkSearch)
            .val(success);
    }
}
