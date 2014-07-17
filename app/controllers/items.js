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
            var anonymousItem;

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
                params.languageCode = this.app.session.get('selectedLanguage');
                params.seo = true;
                delete params.itemId;
                delete params.title;
                delete params.sk;
                done();
            }

            function findCategories(done) {
                this.app.fetch({
                    categories: {
                        collection : 'Categories',
                        params: {
                            location: siteLocation,
                            languageCode: params.languageCode
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

            function checkItem(done, _categories, _item) {
                if (!_categories || !_item) {
                    return done.fail(null, {});
                }
                var item = _item.toJSON();
                var slug = helpers.common.slugToUrl(item);
                var protocol = this.app.session.get('protocol');
                var platform = this.app.session.get('platform');
                var url;

                if (!_item.checkSlug(slug, slugUrl)) {
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
                            location: _item.getLocation().url
                        }
                    });
                }
                done(_categories, _item);
            }

            function findRelatedItems(done, _categories, _item) {
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
            }

            function success(done, _categories, _item, _relatedItems) {
                var item = _item.toJSON();
                var subcategory = _categories.search(_item.get('category').id);
                var parentId = subcategory.get('parentId');
                var category = parentId ? _categories.get(parentId) : subcategory;
                var analytics;
                var url;

                if (!item.purged) {
                    analytics.reset();
                    analytics.addParam('user', user);
                    analytics.addParam('item', item);
                    analytics.addParam('category', category.toJSON());
                    analytics.addParam('subcategory', subcategory.toJSON());
                    analytics = analytics.generateURL.call(this);
                    seo.addMetatag('title', item.metadata.itemPage.title);
                    seo.addMetatag('description', item.metadata.itemPage.description);
                }
                else {
                    seo.addMetatag('robots', 'noindex, nofollow');
                    seo.addMetatag('googlebot', 'noindex, nofollow');
                }
                if (siteLocation && !~siteLocation.indexOf('www.')) {
                    url = helpers.common.removeParams(this.app.session.get('url'), 'location');
                    seo.addMetatag.call(this, 'canonical', helpers.common.fullizeUrl(url, this.app));
                }
                seo.update();
                this.app.session.update({
                    postingLink: {
                        category: category.get('id'),
                        subcategory: subcategory.get('id')
                    }
                });

                console.log({
                    item: item,
                    user: user,
                    pos: Number(params.pos) || 0,
                    sk: securityKey,
                    relatedItems: _relatedItems,
                    relatedAdsLink: ['/', helpers.common.slugToUrl(subcategory.toJSON()), '?relatedAds=', itemId].join(''),
                    subcategory: subcategory.toJSON(),
                    category: category.toJSON(),
                    favorite: favorite,
                    analytics: analytics
                });

                callback(null, {
                    item: item,
                    user: user,
                    pos: Number(params.pos) || 0,
                    sk: securityKey,
                    relatedItems: _relatedItems,
                    relatedAdsLink: ['/', helpers.common.slugToUrl(subcategory.toJSON()), '?relatedAds=', itemId].join(''),
                    subcategory: subcategory.toJSON(),
                    category: category.toJSON(),
                    favorite: favorite,
                    analytics: analytics
                });
            }

            function error(err, res) {
                return helpers.common.error.call(this, err, res, callback);
            }

            asynquence().or(error.bind(this))
                .then(prepare.bind(this))
                .gate(findCategories.bind(this), findItem.bind(this))
                .then(checkItem.bind(this))
                .then(findRelatedItems.bind(this))
                .val(success.bind(this));
        }
    },
    gallery: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var user = this.app.session.get('user');
            var itemId = params.itemId;
            var slugUrl = params.title;
            var pos = Number(params.pos) || 0;

            function prepare(done) {
                if (user) {
                    params.token = user.token;
                }
                params.id = params.itemId;
                delete params.itemId;
                delete params.title;
                done();
            }

            function findCategories(done) {
                this.app.fetch({
                    categories: {
                        collection : 'Categories',
                        params: {
                            location: this.app.session.get('siteLocation'),
                            languageCode: this.app.session.get('selectedLanguage')
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
                    if (err) {
                        return done.fail(err, res);
                    }
                    done(res.item);
                }.bind(this));
            }

            function checkItem(done, _categories, _item) {
                if (!_categories || !_item) {
                    return done.fail(null, {});
                }
                var item = _item.toJSON();
                var slug = helpers.common.slugToUrl(item);
                var platform = this.app.session.get('platform');

                if (platform !== 'html4') {
                    done.abort();
                    return helpers.common.redirect.call(this, ('/' + slug));
                }
                if (!_item.checkSlug(slug, slugUrl)) {
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
                done(_categories, _item);
            }

            function success(_categories, _item) {
                var subcategory = _categories.search(_item.get('category').id);
                var parentId = subcategory.get('parentId');
                var category = parentId ? _categories.get(parentId) : subcategory;
                
                analytics.reset();
                analytics.addParam('user', user);
                analytics.addParam('item', _item.toJSON());
                analytics.addParam('category', category.toJSON());
                analytics.addParam('subcategory', subcategory.toJSON());
                callback(null, {
                    user: user,
                    item: _item.toJSON(),
                    pos: pos,
                    analytics: analytics.generateURL.call(this)
                });
            }

            function error(err, res) {
                return helpers.common.error.call(this, err, res, callback);
            }

            asynquence().or(error.bind(this))
                .then(prepare.bind(this))
                .gate(findCategories.bind(this), findItem.bind(this))
                .then(checkItem.bind(this))
                .val(success.bind(this));
        }
    },
    map: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var user = this.app.session.get('user');
            var itemId = params.itemId;
            var slugUrl = params.title;

            function prepare(done) {
                if (user) {
                    params.token = user.token;
                }
                params.id = params.itemId;
                delete params.itemId;
                delete params.title;
                done();
            }

            function findCategories(done) {
                this.app.fetch({
                    categories: {
                        collection : 'Categories',
                        params: {
                            location: this.app.session.get('siteLocation'),
                            languageCode: this.app.session.get('selectedLanguage')
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
                    if (err) {
                        return done.fail(err, res);
                    }
                    done(res.item);
                }.bind(this));
            }

            function checkItem(done, _categories, _item) {
                if (!_categories || !_item) {
                    return done.fail(null, {});
                }
                var item = _item.toJSON();
                var slug = helpers.common.slugToUrl(item);
                var platform = this.app.session.get('platform');

                if (platform !== 'html4') {
                    done.abort();
                    return helpers.common.redirect.call(this, ('/' + slug));
                }
                if (!_item.checkSlug(slug, slugUrl)) {
                    done.abort();
                    return helpers.common.redirect.call(this, ('/' + slug));
                }
                done(_categories, _item);
            }

            function success(_categories, _item) {
                var subcategory = _categories.search(_item.get('category').id);
                var parentId = subcategory.get('parentId');
                var category = parentId ? _categories.get(parentId) : subcategory;

                analytics.reset();
                analytics.addParam('user', user);
                analytics.addParam('item', _item.toJSON());
                analytics.addParam('category', category.toJSON());
                analytics.addParam('subcategory', subcategory.toJSON());
                callback(null, {
                    item: _item.toJSON(),
                    user: user,
                    analytics: analytics.generateURL.call(this)
                });
            }

            function error(err, res) {
                return helpers.common.error.call(this, err, res, callback);
            }

            asynquence().or(error.bind(this))
                .then(prepare.bind(this))
                .gate(findCategories.bind(this), findItem.bind(this))
                .then(checkItem.bind(this))
                .val(success.bind(this));
        }
    },
    reply: function(params, callback) {
        helpers.controllers.control.call(this, params, {
            isForm: true
        }, controller);

        function controller(form) {
            var user = this.app.session.get('user');

            function prepare(done) {
                params.id = params.itemId;
                delete params.itemId;
                done();
            }

            function findCategories(done) {
                this.app.fetch({
                    categories: {
                        collection : 'Categories',
                        params: {
                            location: this.app.session.get('siteLocation'),
                            languageCode: this.app.session.get('selectedLanguage')
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
                    if (err) {
                        return done.fail(err, res);
                    }
                    done(res.item);
                }.bind(this));
            }

            function success(_categories, _item) {
                if (!_categories || !_item) {
                    return error.call(this, null, {});
                }
                var item = _item.toJSON();
                var platform = this.app.session.get('platform');
                var subcategory;
                var category;
                var parentId;

                if (platform === 'html5') {
                    return helpers.common.redirect.call(this, ['/', params.title, (params.title || '-'), 'iid-', item.id]);
                }
                subcategory = _categories.search(item.category.id);
                parentId = subcategory.get('parentId');
                category = parentId ? _categories.get(parentId) : subcategory;
                analytics.reset();
                analytics.addParam('item', item);
                analytics.addParam('user', user);
                analytics.addParam('category', category.toJSON());
                analytics.addParam('subcategory', subcategory.toJSON());
                seo.addMetatag('robots', 'noindex, nofollow');
                seo.addMetatag('googlebot', 'noindex, nofollow');
                seo.update();
                callback(null, {
                    user: user,
                    item: item,
                    form: form,
                    analytics: analytics.generateURL.call(this)
                });
            }

            function error(err, res) {
                return helpers.common.error.call(this, err, res, callback);
            }

            asynquence().or(error.bind(this))
                .then(prepare.bind(this))
                .gate(findCategories.bind(this), findItem.bind(this))
                .val(success.bind(this));
        }
    },
    success: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var user = this.app.session.get('user');

            function prepare(done) {
                params.id = params.itemId;
                delete params.itemId;
            }

            function findCategories(done) {
                this.app.fetch({
                    categories: {
                        collection : 'Categories',
                        params: {
                            location: this.app.session.get('siteLocation'),
                            languageCode: this.app.session.get('selectedLanguage')
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
                    if (err) {
                        return done.fail(err, res);
                    }
                    done(res.item);
                }.bind(this));
            }

            function success(_categories, _item) {
                if (!_categories || !_item) {
                    return error.call(this, null, {});
                }
                var item = _item.toJSON();
                var subcategory = _categories.search(item.category.id);
                var parentId = subcategory.get('parentId');
                var category = parentId ? _categories.get(parentId) : subcategory;

                analytics.reset();
                analytics.addParam('item', item);
                analytics.addParam('user', user);
                analytics.addParam('category', category.toJSON());
                analytics.addParam('subcategory', subcategory.toJSON());
                callback(null, {
                    item: item,
                    user: user,
                    analytics: analytics.generateURL.call(this)
                });
            }

            function error(err, res) {
                return helpers.common.error.call(this, err, res, callback);
            }

            asynquence().or(error.bind(this))
                .then(prepare.bind(this))
                .gate(findCategories.bind(this), findItem.bind(this))
                .val(success.bind(this));
        }
    },
    search: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var page = params ? params.page : undefined;
            var user = this.app.session.get('user');
            var query;

            function prepare(done) {
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
                    seo.update();
                    done.abort();
                    return callback(null, {
                        search: '',
                        metadata: {
                            total: 0
                        },
                        analytics: analytics.generateURL.call(this)
                    });
                }
                done();
            }

            function findItems(done) {
                this.app.fetch({
                    items: {
                        collection: 'Items',
                        params: params
                    }
                }, {
                    readFromCache: false
                }, function afterFetch(err, res) {
                    if (err) {
                        return done.fail(err, res);
                    }
                    done(res.item);
                }.bind(this));
            }

            function checkSearch(done, _items) {
                if (!_items) {
                    return error.call(this, null, {});
                }
                var items = _items.toJSON();
                
                if (typeof page !== 'undefined' && (isNaN(page) || page <= 1 || page >= 999999  || !items.length)) {
                    done.abort();
                    return helpers.common.redirect.call(this, '/nf/search/' + query.search);
                }
                done(_items);
            }

            function success(_items) {
                var url = ['/nf/search/', query.search, '/'].join('');
                var metadata = _items.metadata;
                
                if (metadata.total < 5) {
                    seo.addMetatag('robots', 'noindex, follow');
                    seo.addMetatag('googlebot', 'noindex, follow');
                }
                helpers.pagination.paginate(metadata, query, url);
                analytics.addParam('page_nb', metadata.totalPages);
                seo.addMetatag('title', query.search + (metadata.page > 1 ? (' - ' + metadata.page) : ''));
                seo.addMetatag('description');
                seo.update();
                callback(null, {
                    user: user,
                    items: _items.toJSON(),
                    metadata: metadata,
                    search: query.search,
                    analytics: analytics.generateURL.call(this)
                });
            }

            function error(err, res) {
                return helpers.common.error.call(this, err, res, callback);
            }

            asynquence().or(error.bind(this))
                .then(prepare.bind(this))
                .then(findItems.bind(this))
                .then(checkSearch.bind(this))
                .val(success.bind(this));
        }
    },
    favorite: function(params, callback) {
        var user;
        var intent;

        function prepare(done) {
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
        }

        function add(done) {
            helpers.dataAdapter.post(this.app.req, '/users/' + user.userId + '/favorites/' + params.itemId + (intent ? '/' + intent : ''), {
                query: {
                    token: user.token
                }
            }, done.errfcb);
        }

        function success() {
            var url = (params.redirect || '/des-iid-' + params.itemId);

            url = helpers.common.params(url, 'favorite', (intent || 'add'));
            helpers.common.redirect.call(this, url, null, {
                status: 302
            });
        }

        function error() {
            helpers.common.redirect.call(this, params.redirect || '/des-iid-' + params.itemId, null, {
                status: 302
            });
        }

        asynquence().or(error.bind(this))
            .then(prepare.bind(this))
            .then(add.bind(this))
            .val(success.bind(this));
    },
    delete: function(params, callback) {
        var user;
        var itemId;

        function prepare(done) {
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
        }

        function remove(done) {
            helpers.dataAdapter.post(this.app.req, ('/items/' + itemId + '/delete'), {
                query: {
                    token: user.token
                }
            }, done.errfcb);
        }

        function success() {
            helpers.common.redirect.call(this, '/myolx/myadslisting?deleted=true', null, {
                status: 302
            });
        }

        function error() {
            helpers.common.redirect.call(this, '/myolx/myadslisting', null, {
                status: 302
            });
        }

        asynquence().or(error.bind(this))
            .then(prepare.bind(this))
            .then(remove.bind(this))
            .val(success.bind(this));
    }
};
