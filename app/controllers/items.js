'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var middlewares = require('../middlewares');
var helpers = require('../helpers');
var Filters = require('../modules/filters');
var Item = require('../models/item');
var config = require('../../shared/config');
var statsd = require('../../shared/statsd')();
var Shops = require('../modules/shops');

module.exports = {
    show: middlewares(show),
    gallery: middlewares(gallery),
    map: middlewares(map),
    reply: middlewares(reply),
    success: middlewares(success),
    favorite: middlewares(favorite),
    flag: middlewares(flag),
    'delete': middlewares(deleteitem),
    filter: middlewares(filter),
    sort: middlewares(sort),
    safetytips: middlewares(safetytips)
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
        var newItemPage = helpers.features.isEnabled.call(this, 'newItemPage');
        var anonymousItem;
        var location = this.app.session.get('location');
        var isSafetyTipsEnabled = helpers.features.isEnabled.call(this, 'safetyTips', platform, location.url);

        new Shops(this).evaluate(params);

        var promise = asynquence().or(fail.bind(this))
            .then(prepare.bind(this))
            .then(fetch.bind(this))
            .then(check.bind(this));

        if (!config.getForMarket(this.app.session.get('location').url, ['relatedAds', platform, 'enabled'], false)) {
            promise.then(fetchRelateds.bind(this));
        }
        promise
            .val(success.bind(this))
            .val(origin.bind(this));

        function prepare(done) {
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
        }

        function fetch(done) {
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
                    res.item = buildItemPurged.call(this, err.body);
                    err = null;
                }
                if (!res.item.get('status')) {
                    console.log('[OLX_DEBUG]', 'no status', res.item.get('id'));
                    return fail.call(this, new Error(), res);
                }
                else if (!res.item.get('status').open && !res.item.get('status').onReview) {
                    res.item.set('purged', true);
                }
                done(res);
            }.bind(this));
        }

        function buildItemPurged(properties) {
            var item = new Item(properties, {
                app: this.app
            });

            if (!item.get('id')) {
                item.set('id', item.get('itemId'));
                item.unset('itemId');
            }
            if (_.isEmpty(item.get('category'))) {
                item.set('category', {
                    id: item.get('categoryId'),
                    name: item.get('categoryName'),
                    parentId: item.get('parentCategoryId')
                });
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
        }

        function check(done, response) {
            if (!response.item) {
                return done.fail(null, {});
            }
            var slug = helpers.common.slugToUrl(response.item.toJSON());
            var protocol = this.app.session.get('protocol');
            var host = this.app.session.get('host');
            var shortHost = this.app.session.get('shortHost');
            var itemLocation = response.item.getLocation().url || response.item.get('location').url;
            var url;

            if (platform === 'desktop' && itemLocation && itemLocation !== this.app.session.get('siteLocation')) {
                url = [protocol, '://', host.replace(shortHost, itemLocation), '/', slug].join('');
                done.abort();
                return helpers.common.redirect.call(this, url, null, {
                    pushState: false
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
                url = [protocol, '://', this.app.session.get('host'), '/', slug].join('');

                done.abort();
                return helpers.common.redirect.call(this, url, null, {
                    pushState: false,
                    query: {
                        location: itemLocation
                    }
                });
            }
            done(response.item);
        }

        function fetchRelateds(done, item) {
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
        }

        function success(_item, relatedItems) {
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

            this.app.seo.addMetatag('og:title', item.title);
            this.app.seo.addMetatag('og:description', item.description);
            this.app.seo.addMetatag('og:type', 'article');
            this.app.seo.addMetatag('og:site_name', 'olx');
            this.app.seo.addMetatag('og:url', item.slug);
            if (item.images.length) {
                this.app.seo.addMetatag('og:image', item.images[0].url);
                this.app.seo.addMetatag('og:image:type', 'image/jpeg');
            }
            else {
                this.app.seo.addMetatag('og:image', 'http://static01.olx-st.com/mobile-webapp/images/desktop/logo.png');
                this.app.seo.addMetatag('og:image:type', 'image/png');
            }

            this.app.tracking.set('item', item);
            this.app.tracking.set('category', category);
            this.app.tracking.set('subcategory', subcategory);
            this.app.session.update({
                dataPage: {
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
            else if (newItemPage && platform === 'html5') {
                view = 'items/newitempage/show';
            }

            callback(null, view, {
                include: ['item'],
                item: item,
                pos: Number(params.pos) || 0,
                sk: securityKey,
                relatedItems: relatedItems || [],
                relatedAdsLink: (subcategory ? ['/', helpers.common.slugToUrl(subcategory), '?relatedAds=', itemId].join('') : undefined),
                subcategory: subcategory,
                category: category,
                favorite: favorite,
                sent: params.sent,
                categories: this.dependencies.categories.toJSON(),
                isSafetyTipsEnabled: isSafetyTipsEnabled
            });
        }

        function origin() {
            var originData = this.app.session.get('origin');
            var type = 'unknown';
            var name = 'unknown';

            if (originData) {
                type = originData.type;
                name = originData.isGallery ? 'gallery' : 'listing';
            }
            statsd.increment([this.app.session.get('location').abbreviation, 'dgd', 'item', type, name, this.app.session.get('platform')]);
        }

        function fail(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }
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

            this.app.tracking.set('item', item);
            this.app.tracking.set('category', category.toJSON());
            this.app.tracking.set('subcategory', subcategory.toJSON());

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

            this.app.tracking.set('item', _item.toJSON());
            this.app.tracking.set('category', category.toJSON());
            this.app.tracking.set('subcategory', subcategory.toJSON());
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
        var location = this.app.session.get('location');
        var platform = this.app.session.get('platform');
        var newItemPage = helpers.features.isEnabled.call(this, 'newItemPage');
        var isHermes = helpers.features.isEnabled.call(this, 'hermes');
        var user = this.app.session.get('user');

        asynquence().or(error.bind(this))
            .then(redirect.bind(this))
            .then(prepare.bind(this))
            .then(findItem.bind(this))
            .then(checkItem.bind(this))
            .then(verifyConversations.bind(this))
            .val(success.bind(this));

        function redirect(done) {
            if (platform === 'desktop' || (platform === 'html5' && !newItemPage)) {
                return done.fail();
            }
            done();
        }

        function prepare(done) {
            params.id = params.itemId;
            delete params.itemId;
            done();
        }

        function findItem(done) {
            this.app.fetch({
                item: {
                    model: 'Item',
                    params: params
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }

        function checkItem(done, resItem) {
            if (!resItem.item) {
                return done.fail(null, {});
            }
            if (platform === 'desktop' || (platform === 'html5' && !newItemPage)) {
                return done.fail();
            }
            done(resItem.item);
        }

        function verifyConversations(done,_item) {
            if (!isHermes || !user || platform !== 'html5') {
                return done(_item);
            }

            asynquence().or(done.fail)
                .then(verifyConversation.bind(this))
                .val(successConversation.bind(this));

            function verifyConversation(done) {
                helpers.dataAdapter.post(this.app.req, '/conversations', {
                    query: {
                        location: location.url,
                        platform: platform
                    },
                    data: {
                        itemIds: itemId,
                        emails: user.email
                    },
                    cache: false
                }, done.errfcb);
            }

            function successConversation(response, body) {
                if (!body.conversations || !body.conversations.length) {
                    return done(_item);
                }

                var threadId = body.conversations[0].threadId;

                done.abort();
                return helpers.common.redirect.call(this, '/myolx/conversation/' + threadId, null, {
                    status: 302,
                    replace: true
                });
            }
         }

        function success(_item) {
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

            this.app.tracking.set('item', item);
            this.app.tracking.set('category', category.toJSON());
            this.app.tracking.set('subcategory', subcategory.toJSON());

            callback(null, {
                item: item,
                form: this.form
            });
        }

        function error(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }
    }
}

function safetytips(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
       var itemId = params.itemId;
       var platform = this.app.session.get('platform');
       var location = this.app.session.get('location');

        asynquence().or(fail.bind(this))
            .then(redirect.bind(this))
            .then(prepare.bind(this))
            .then(findItem.bind(this))
            .then(checkItem.bind(this))
            .then(featureValidation.bind(this))
            .val(success.bind(this));

        function redirect(done) {
            if (platform !== 'html4') {
                return done.fail();
            }
            done();
        }

        function prepare(done) {
           params.id = params.itemId;
           delete params.itemId;
           done();
        }

        function findItem(done) {
           this.app.fetch({
               item: {
                   model: 'Item',
                   params: params
               }
           }, {
               readFromCache: false
           }, done.errfcb);
        }

        function checkItem(done, res) {
           if (!res.item) {
               return done.fail();
           }
           done(res.item);
        }

        function featureValidation(done, _item) {
            var isEnabled = helpers.features.isEnabled.call(this, 'safetyTips', platform, location.url);
            var isValidAction = _.contains(['sms', 'call', 'email'], params.intent);
            var slug = helpers.common.slugToUrl(_item.toJSON());

            if (!(isEnabled && isValidAction) || (_item.get('phone') === '' && params.intent !== 'email' )) {
                done.abort();
                return helpers.common.redirect.call(this, ('/' + slug));
            }
            done(_item);
        }

        function success(_item) {
            var item = _item.toJSON();
            var subcategory = this.dependencies.categories.search(item.category.id);
            var category;
            var parentId;

            if (!subcategory) {
               return fail();
            }
            parentId = subcategory.get('parentId');
            category = parentId ? this.dependencies.categories.get(parentId) : subcategory;

            this.app.seo.addMetatag('robots', 'noindex, nofollow');
            this.app.seo.addMetatag('googlebot', 'noindex, nofollow');

            this.app.tracking.setPage(params.intent);
            this.app.tracking.set('item', item);
            this.app.tracking.set('category', category.toJSON());
            this.app.tracking.set('subcategory', subcategory.toJSON());

            callback(null, {
                item: item
            });
        }

        function fail(err, res) {
           return helpers.common.error.call(this, err, res, callback);
        }
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

            this.app.tracking.set('item', item);
            this.app.tracking.set('category', category.toJSON());
            this.app.tracking.set('subcategory', subcategory.toJSON());

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

function flag(params, callback) {

    var user;

    var prepare = function(done) {
        var platform = this.app.session.get('platform');
        var url;

        if (platform === 'wap') {
            done.abort();
            return helpers.common.redirect.call(this, '/');
        }

        user = !!this.app.session.get('user');
        
        // store metric here

        console.log('interestín!', user);

        done();
    }.bind(this);

    
    var success = function() {
        var url = (params.redirect || '/des-iid-' + params.itemId);

        url = helpers.common.params(url);
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
        .val(success);
}

function deleteitem(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var itemId = params.itemId;
        var platform = this.app.session.get('platform');

        var redirect = function(done) {
            if (platform !== 'html4') {
                done.abort();
                return helpers.common.redirect.call(this, '/');
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
            done(resItem.item);
        }.bind(this);

        var success = function(_item) {
            var item = _item.toJSON();

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

        var success = function(options) {
            this.app.seo.addMetatag('robots', 'noindex, nofollow');
            this.app.seo.addMetatag('googlebot', 'noindex, nofollow');
            callback(null, 'items/sort', {
                sorts: Filters.sorts()
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(redirect)
            .val(success);
    }
}
