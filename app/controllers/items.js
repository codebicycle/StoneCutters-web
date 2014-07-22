'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var helpers = require('../helpers');
var seo = require('../seo');
var analytics = require('../analytics');
var config = require('../config');
var Item = require('../models/item');

module.exports = {
    show: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var user = this.app.session.get('user');
            var securityKey = params.sk;
            var itemId = params.itemId;
            var slugUrl = params.title;
            var favorite = params.favorite;
            var siteLocation = this.app.session.get('siteLocation');
            var languages = this.app.session.get('languages');
            var anonymousItem;

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
            params.languageId = languages._byId[this.app.session.get('selectedLanguage')].id;
            params.seo = true;
            delete params.itemId;
            delete params.title;
            delete params.sk;

            function findCategories(done) {
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
                }, function afterFetch(err, res) {
                    if (err) {
                        return done.fail(err, res);
                    }
                    done(res.categories);
                }.bind(this));
            }


            function findItem(done) {
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
                        res.item = new Item(err.body);
                        res.item.set('id', itemId);
                        res.item.set('slug', '/des-iid-' + itemId);
                        res.item.set('location', this.app.session.get('location'));
                        res.item.set('title', 'Item title');
                        res.item.set('date', {
                            timestamp: new Date().toISOString()
                        });
                        res.item.set('description', 'Item description');
                        res.item.set('category', {
                            id: res.item.get('categoryId'),
                            name: res.item.get('categoryName')
                        });
                        res.item.set('status', {
                            deprecated: true
                        });
                        res.item.set('purged', true);
                        err = null;
                    }
                    done(res.item);
                }.bind(this));
            }

            function findRelatedItems(_categories, _item) {
                if (!_categories || !_item) {
                    return helpers.common.error.call(this, null, {}, callback);
                }
                var item = _item.toJSON();
                var protocol = this.app.session.get('protocol');
                var platform = this.app.session.get('platform');
                var slug;

                slug = helpers.common.slugToUrl(item);
                if (!_item.checkSlug(slug, slugUrl)) {
                    slug = ('/' + slug);
                    if (favorite) {
                        slug = helpers.common.params(slug, 'favorite', favorite);
                    }
                    return helpers.common.redirect.call(this, slug);
                }
                if (item.location.url !== this.app.session.get('location').url) {
                    var url = [protocol, '://', platform, '.', item.location.url.replace('www.', 'm.'), '/', slug].join('');

                    return helpers.common.redirect.call(this, url, null, {
                        pushState: false,
                        query: {
                            location: _item.getLocation().url
                        }
                    });
                }
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
                }, function afterFetch(err, result) {
                    var subcategory = _categories.search(item.category.id);
                    if (!subcategory) {
                        console.log('[OLX_DEBUG] No subcategory ' + item.category.id + ' for item ' + item.id + ' (' + itemId + ') on ' + siteLocation + ' (' + _categories.length + ') - Controller ' + this.currentRoute.controller + ' / Action ' + this.currentRoute.action);
                        return helpers.common.error.call(this, null, {}, callback);
                    }
                    var parentId = subcategory.get('parentId');
                    var category = parentId ? _categories.get(parentId) : subcategory;

                    if (err) {
                        err = null;
                        result = {
                            relatedItems: []
                        };
                    }
                    else {
                        result.relatedItems = result.relatedItems.toJSON();
                    }
                    result.user = user;
                    result.item = item;
                    result.pos = Number(params.pos) || 0;
                    result.sk = securityKey;
                    result.relatedAdsLink = ['/', helpers.common.slugToUrl(subcategory.toJSON()), '?relatedAds=', itemId].join('');
                    result.subcategory = subcategory.toJSON();
                    result.category = category.toJSON();
                    result.favorite = favorite;

                    if (!item.purged) {
                        analytics.reset();
                        analytics.addParam('user', user);
                        analytics.addParam('item', item);
                        analytics.addParam('category', category.toJSON());
                        analytics.addParam('subcategory', subcategory.toJSON());
                        result.analytics = analytics.generateURL.call(this);
                        seo.addMetatag('title', item.metadata.itemPage.title);
                        seo.addMetatag('description', item.metadata.itemPage.description);
                    }
                    else {
                        seo.addMetatag('robots', 'noindex, nofollow');
                        seo.addMetatag('googlebot', 'noindex, nofollow');
                    }
                    if (siteLocation && !~siteLocation.indexOf('www.')) {
                        var url = this.app.session.get('url');

                        seo.addMetatag.call(this, 'canonical', helpers.common.fullizeUrl(helpers.common.removeParams(url, 'location'), this.app));
                    }
                    seo.update();
                    this.app.session.update({
                        postingLink: {
                            category: category.get('id'),
                            subcategory: subcategory.get('id')
                        }
                    });
                    callback(err, result);
                }.bind(this));
            }

            function error(err, res) {
                return helpers.common.error.call(this, err, res, callback);
            }

            asynquence().or(error.bind(this))
                .gate(findCategories.bind(this), findItem.bind(this))
                .val(findRelatedItems.bind(this));
        }
    },
    gallery: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var user = this.app.session.get('user');
            var itemId = params.itemId;
            var slugUrl = params.title;
            var pos = Number(params.pos) || 0;
            var slug;

            if (user) {
                params.token = user.token;
            }
            params.id = params.itemId;
            delete params.itemId;
            delete params.title;

            this.app.fetch({
                categories: {
                    collection : 'Categories',
                    params: {
                        location: this.app.session.get('siteLocation'),
                        languageCode: this.app.session.get('selectedLanguage')
                    }
                },
                item: {
                    model: 'Item',
                    params: params
                }
            }, {
                readFromCache: false
            }, function afterFetch(err, result) {
                if (err || !result.item) {
                    return helpers.common.error.call(this, err, result, callback);
                }

                var item = result.item.toJSON();
                var platform = this.app.session.get('platform');

                slug = helpers.common.slugToUrl(item);
                if (platform !== 'html4') {
                    return helpers.common.redirect.call(this, ('/' + slug));
                }
                if (!result.item.checkSlug(slug, slugUrl)) {
                    return helpers.common.redirect.call(this, ('/' + slug));
                }
                if (!item.images || !item.images.length) {
                    return helpers.common.redirect.call(this, ('/' + slug));
                }
                if (pos < 0 || pos >= item.images.length) {
                    return helpers.common.redirect.call(this, ('/' + slug + '/gallery'));
                }
                var subcategory = result.categories.search(item.category.id);
                if (!subcategory) {
                    console.log('[OLX_DEBUG] No subcategory ' + item.category.id + ' on ' + this.app.session.get('siteLocation') + ' (' + result.categories.length + ') - Controller ' + this.currentRoute.controller + ' / Action ' + this.currentRoute.action);
                    return helpers.common.error.call(this, null, {}, callback);
                }
                var parentId = subcategory.get('parentId');
                var category = parentId ? result.categories.get(parentId) : subcategory;

                result.item = item;
                result.user = user;
                result.pos = pos;
                analytics.reset();
                analytics.addParam('user', user);
                analytics.addParam('item', item);
                analytics.addParam('category', category.toJSON());
                analytics.addParam('subcategory', subcategory.toJSON());
                result.analytics = analytics.generateURL.call(this);
                callback(err, result);
            }.bind(this));
        }
    },
    map: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var user = this.app.session.get('user');
            var itemId = params.itemId;
            var slugUrl = params.title;
            var siteLocation = this.app.session.get('siteLocation');
            var spec;
            var slug;

            if (user) {
                params.token = user.token;
            }
            params.id = params.itemId;
            delete params.itemId;
            delete params.title;

            spec = {
                categories: {
                    collection : 'Categories',
                    params: {
                        location: siteLocation,
                        languageCode: this.app.session.get('selectedLanguage')
                    }
                },
                item: {
                    model: 'Item',
                    params: params
                }
            };
            this.app.fetch(spec, {
                'readFromCache': false
            }, function afterFetch(err, result) {
                if (err || !result.item) {
                    return helpers.common.error.call(this, err, result, callback);
                }
                var item = result.item.toJSON();
                var platform = this.app.session.get('platform');

                slug = helpers.common.slugToUrl(item);
                if (platform !== 'html4') {
                    return helpers.common.redirect.call(this, ('/' + slug));
                }
                if (!result.item.checkSlug(slug, slugUrl)) {
                    return helpers.common.redirect.call(this, ('/' + slug));
                }
                var subcategory = result.categories.search(item.category.id);
                if (!subcategory) {
                    console.log('[OLX_DEBUG] No subcategory ' + item.category.id + ' on ' + this.app.session.get('siteLocation') + ' (' + result.categories.length + ') - Controller ' + this.currentRoute.controller + ' / Action ' + this.currentRoute.action);
                    return helpers.common.error.call(this, null, {}, callback);
                }
                var parentId = subcategory.get('parentId');
                var category = parentId ? result.categories.get(parentId) : subcategory;

                result.item = item;
                result.user = user;
                analytics.reset();
                analytics.addParam('user', user);
                analytics.addParam('item', item);
                analytics.addParam('category', category.toJSON());
                analytics.addParam('subcategory', subcategory.toJSON());
                result.analytics = analytics.generateURL.call(this);
                callback(err, result);
            }.bind(this));
        }
    },
    search: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var page = params ? params.page : undefined;
            var user = this.app.session.get('user');
            var query;

            helpers.pagination.prepare(this.app, params);
            query = _.clone(params);
            delete params.search;
            delete params.page;
            delete params.filters;
            delete params.urlFilters;

            analytics.reset();
            analytics.setPage('nf');
            analytics.addParam('keyword', query.search);
            analytics.addParam('page_nb', 0);
            analytics.addParam('user', user);

            if (!query.search || _.isEmpty(query.search.trim())) {
                seo.addMetatag('robots', 'noindex, follow');
                seo.addMetatag('googlebot', 'noindex, follow');
                return callback(null, {
                    analytics: analytics.generateURL.call(this),
                    search: '',
                    metadata: {
                        total: 0
                    }
                });
            }

            this.app.fetch({
                items: {
                    collection: 'Items',
                    params: params
                }
            }, {
                readFromCache: false
            }, function afterFetch(err, result) {
                var url = '/nf/search/' + query.search + '/';
                var currentPage;

                if (err) {
                    return helpers.common.error.call(this, null, {}, callback);
                }
                result.metadata = result.items.metadata;
                result.items = result.items.toJSON();
                if (typeof page !== 'undefined' && (isNaN(page) || page <= 1 || page >= 999999  || !result.items.length)) {
                    return helpers.common.redirect.call(this, '/nf/search/' + query.search);
                }

                if (result.metadata.total < 5) {
                    seo.addMetatag('robots', 'noindex, follow');
                    seo.addMetatag('googlebot', 'noindex, follow');
                }
                helpers.pagination.paginate(result.metadata, query, url);
                analytics.addParam('page_nb', result.metadata.totalPages);
                result.analytics = analytics.generateURL.call(this);
                result.search = query.search;

                currentPage = result.metadata.page;
                seo.addMetatag('title', query.search + (currentPage > 1 ? (' - ' + currentPage) : ''));
                seo.addMetatag('description');
                seo.update();
                callback(err, result);
            }.bind(this));
        }
    },
    reply: function(params, callback) {
        helpers.controllers.control.call(this, params, {
            isForm: true
        }, controller);

        function controller(form) {
            params.id = params.itemId;
            delete params.itemId;

            this.app.fetch({
                categories: {
                    collection : 'Categories',
                    params: {
                        location: this.app.session.get('siteLocation'),
                        languageCode: this.app.session.get('selectedLanguage')
                    }
                },
                item: {
                    model: 'Item',
                    params: params
                }
            }, {
                readFromCache: false
            }, function afterFetch(err, result) {
                if (err || !result.item) {
                    return helpers.common.error.call(this, err, result, callback);
                }
                var item = result.item.toJSON();

                if (this.app.session.get('platform') === 'html5') {
                    return helpers.common.redirect.call(this, '/' + params.title + '-iid-' + item.id);
                }
                var subcategory = result.categories.search(item.category.id);
                if (!subcategory) {
                    console.log('[OLX_DEBUG] No subcategory ' + item.category.id + ' on ' + this.app.session.get('siteLocation') + ' (' + result.categories.length + ') - Controller ' + this.currentRoute.controller + ' / Action ' + this.currentRoute.action);
                    return helpers.common.error.call(this, null, {}, callback);
                }
                var parentId = subcategory.get('parentId');
                var category = parentId ? result.categories.get(parentId) : subcategory;

                analytics.reset();
                analytics.addParam('item', item);
                analytics.addParam('category', category.toJSON());
                analytics.addParam('subcategory', subcategory.toJSON());
                result.analytics = analytics.generateURL.call(this);
                result.user = this.app.session.get('user');
                result.item = item;
                result.form = form;

                seo.addMetatag('robots', 'noindex, nofollow');
                seo.addMetatag('googlebot', 'noindex, nofollow');
                seo.update();

                callback(err, result);
            }.bind(this));
        }
    },
    success: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            params.id = params.itemId;
            delete params.itemId;

            this.app.fetch({
                categories: {
                    collection : 'Categories',
                    params: {
                        location: this.app.session.get('siteLocation'),
                        languageCode: this.app.session.get('selectedLanguage')
                    }
                },
                item: {
                    model: 'Item',
                    params: params
                }
            }, {
                readFromCache: false
            }, function afterFetch(err, result) {
                if (err || !result.item) {
                    return helpers.common.error.call(this, err, result, callback);
                }
                var item = result.item.toJSON();
                var subcategory = result.categories.search(item.category.id);
                if (!subcategory) {
                    console.log('[OLX_DEBUG] No subcategory ' + item.category.id + ' on ' + this.app.session.get('siteLocation') + ' (' + result.categories.length + ') - Controller ' + this.currentRoute.controller + ' / Action ' + this.currentRoute.action);
                    return helpers.common.error.call(this, null, {}, callback);
                }
                var parentId = subcategory.get('parentId');
                var category = parentId ? result.categories.get(parentId) : subcategory;

                analytics.reset();
                analytics.addParam('item', item);
                analytics.addParam('category', category.toJSON());
                analytics.addParam('subcategory', subcategory.toJSON());
                result.analytics = analytics.generateURL.call(this);
                result.user = this.app.session.get('user');
                result.item = item;
                callback(err, result);
            }.bind(this));
        }
    },
    favorite: function(params, callback) {
        var platform = this.app.session.get('platform');
        var user;
        var intent;

        if (platform === 'wap') {
            return helpers.common.redirect.call(this, '/');
        }
        user = this.app.session.get('user');
        if (!user) {
            var url = helpers.common.params('/login', 'redirect', (params.redirect || '/des-iid-' + params.itemId));

            return helpers.common.redirect.call(this, url, null, {
                status: 302
            });
        }
        intent = !params.intent || params.intent === 'undefined' ? undefined : params.intent;

        function add(done) {
            helpers.dataAdapter.post(this.app.req, '/users/' + user.userId + '/favorites/' + params.itemId + (intent ? '/' + intent : ''), {
                query: {
                    token: user.token
                }
            }, done.errfcb);
        }

        function success(done) {
            var url = (params.redirect || '/des-iid-' + params.itemId);

            url = helpers.common.params(url, 'favorite', (intent || 'add'));
            helpers.common.redirect.call(this, url, null, {
                status: 302
            });
        }

        function error(done) {
            helpers.common.redirect.call(this, params.redirect || '/des-iid-' + params.itemId, null, {
                status: 302
            });
        }

        asynquence().or(error.bind(this))
            .then(add.bind(this))
            .val(success.bind(this));
    },
    delete: function(params, callback) {
        var platform = this.app.session.get('platform');
        var user;
        var itemId;

        if (platform === 'wap') {
            return helpers.common.redirect.call(this, '/');
        }
        user = this.app.session.get('user');
        if (!user) {
            return helpers.common.redirect.call(this, '/login', null, {
                status: 302
            });
        }
        itemId = !params.itemId || params.itemId === 'undefined' ? undefined : params.itemId;

        function remove(done) {
            helpers.dataAdapter.post(this.app.req, ('/items/' + itemId + '/delete'), {
                query: {
                    token: user.token
                }
            }, done.errfcb);
        }

        function success(done) {
            helpers.common.redirect.call(this, '/myolx/myadslisting?deleted=true', null, {
                status: 302
            });
        }

        function error(done) {
            helpers.common.redirect.call(this, '/myolx/myadslisting', null, {
                status: 302
            });
        }

        asynquence().or(error.bind(this))
            .then(remove.bind(this))
            .val(success.bind(this));
    }
};
