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
            var spec;

            if (user) {
                params.token = user.token;
            }
            else if (typeof window !== 'undefined' && localStorage) {
                anonymousItem = localStorage.getItem('anonymousItem');
                anonymousItem = (!anonymousItem ? {} : JSON.parse(anonymousItem));
                if (securityKey) {
                    anonymousItem[params.itemId] = securityKey;
                    localStorage.setItem('anonymousItem', JSON.stringify(anonymousItem));
                }
                else {
                    securityKey = anonymousItem[params.itemId];
                }
            }
            params.id = params.itemId;
            params.languageCode = this.app.session.get('selectedLanguage');
            delete params.itemId;
            delete params.title;
            delete params.sk;

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
            }, function afterFetch(err, result) {
                if (err) {
                    return helpers.common.error.call(this, err, result, callback);
                }
                findItem.call(this, err, result);
            }.bind(this));

            function findItem(err, res) {
                this.app.fetch({
                    item: {
                        model: 'Item',
                        params: params
                    }
                }, {
                    readFromCache: false
                }, function afterFetch(err, result) {
                    if (!result) {
                        result = {};
                    }
                    if (err) {
                        if (err.status !== 422) {
                            return helpers.common.error.call(this, err, result, callback);
                        }
                        result.item = new Item(err.body);
                        result.item.set('id', result.item.get('itemId'));
                        result.item.set('slug', '/des-iid-' + result.item.get('id'));
                        result.item.set('location', this.app.session.get('location'));
                        result.item.set('title', 'Item title');
                        result.item.set('date', {
                            timestamp: new Date().toISOString()
                        });
                        result.item.set('description', 'Item description');
                        result.item.set('category', {
                            id: result.item.get('categoryId'),
                            name: result.item.get('categoryName')
                        });
                        result.item.set('status', {
                            deprecated: true
                        });
                        result.item.set('purged', true);
                        err = null;
                    }
                    result.categories = res.categories;
                    findRelatedItems.call(this, err, result);
                }.bind(this));
            }

            function findRelatedItems(err, res) {
                if (!res.item) {
                    return helpers.common.error.call(this, err, res, callback);
                }
                var item = res.item.toJSON();
                var slug;

                slug = helpers.common.slugToUrl(item);
                if (slugUrl && slug.indexOf(slugUrl + '-iid-')) {
                    slug = ('/' + slug);
                    if (favorite) {
                        slug = helpers.common.params(slug, 'favorite', favorite);
                    }
                    return helpers.common.redirect.call(this, slug);
                }
                if (item.location.url !== this.app.session.get('location').url) {
                    var protocol = this.app.session.get('protocol');
                    var platform = this.app.session.get('platform');
                    var url = [protocol, '://', platform, '.', item.location.url.replace('www.', 'm.'), '/', slug].join('');

                    return helpers.common.redirect.call(this, url, null, {
                        pushState: false,
                        query: {
                            location: res.item.getLocation().url
                        }
                    });
                }
                
                this.app.fetch({
                    items: {
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
                    var relatedItems = [];
                    var user = this.app.session.get('user');
                    var subcategory = res.categories.search(item.category.id);
                    var category;
                    
                    if (!result) {
                        result = {};
                    }
                    if (result.items) {
                        relatedItems = result.items.models[0].get('data');
                    }
                    result.relatedItems = relatedItems;
                    result.user = user;
                    result.item = item;
                    result.pos = Number(params.pos) || 0;
                    result.sk = securityKey;
                    category = res.categories.get(subcategory.get('parentId'));
                    result.relatedAdsLink = '/' + helpers.common.slugToUrl(subcategory.toJSON()) + '?relatedAds=' + itemId;
                    result.favorite = favorite;

                    if (!item.purged) {
                        analytics.reset();
                        analytics.addParam('user', user);
                        analytics.addParam('item', item);
                        analytics.addParam('category', category.toJSON());
                        analytics.addParam('subcategory', subcategory.toJSON());
                        result.analytics = analytics.generateURL.call(this);

                        seo.addMetatag('title', res.item.shortTitle());
                        seo.addMetatag('description', res.item.shortDescription());
                    }
                    else {
                        seo.addMetatag('robots', 'noindex, nofollow');
                        seo.addMetatag('googlebot', 'noindex, nofollow');
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
        }
    },
    gallery: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var user = this.app.session.get('user');
            var itemId = params.itemId;
            var slugUrl = params.title;
            var pos = Number(params.pos) || 0;
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
                readFromCache: false
            }, function afterFetch(err, result) {
                if (err || !result.item) {
                    return helpers.common.error.call(this, err, result, callback);
                }
                
                var item = result.item.toJSON();
                var platform = this.app.session.get('platform');
                var subcategory;

                slug = helpers.common.slugToUrl(item);
                if (slugUrl && slug.indexOf(slugUrl + '-iid-') || platform !== 'html4') {
                    return helpers.common.redirect.call(this, ('/' + slug));
                }
                if (!item.images || !item.images.length) {
                    return helpers.common.redirect.call(this, ('/' + slug));
                }
                if (pos < 0 || pos >= item.images.length) {
                    return helpers.common.redirect.call(this, ('/' + slug + '/gallery'));
                }

                subcategory = result.categories.search(item.category.id);
                result.item = item;
                result.user = user;
                result.pos = pos;
                analytics.reset();
                analytics.addParam('user', user);
                analytics.addParam('item', item);
                analytics.addParam('category', result.categories.get(subcategory.get('parentId')).toJSON());
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
                var subcategory;

                slug = helpers.common.slugToUrl(item);
                if (slugUrl && slug.indexOf(slugUrl + '-iid-') || platform !== 'html4') {
                    return helpers.common.redirect.call(this, ('/' + slug));
                }

                subcategory = result.categories.search(item.category.id);
                result.item = item;
                result.user = user;
                analytics.reset();
                analytics.addParam('user', user);
                analytics.addParam('item', item);
                analytics.addParam('category', result.categories.get(subcategory.get('parentId')).toJSON());
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
                var model = result.items.models[0];

                result.items = model.get('data');
                result.metadata = model.get('metadata');
                if (typeof page !== 'undefined' && (isNaN(page) || page <= 1 || page >= 999999  || !result.items.length)) {
                    return helpers.common.redirect.call(this, '/nf/search/' + query.search);
                }

                if (result.metadata.total < 5){
                    seo.addMetatag('robots', 'noindex, follow');
                    seo.addMetatag('googlebot', 'noindex, follow');
                }
                seo.addMetatag.call(this, 'title', query.search);
                seo.addMetatag.call(this, 'description', query.search);
                seo.update();

                helpers.pagination.paginate(result.metadata, query, url);
                analytics.addParam('page_nb', result.metadata.totalPages);
                result.analytics = analytics.generateURL.call(this);
                result.search = query.search;
                callback(err, result);
            }.bind(this));
        }
    },
    reply: function(params, callback) {
        helpers.controllers.control.call(this, params, {
            isForm: true
        }, controller);

        function controller(form) {
            var user = this.app.session.get('user');
            var platform = this.app.session.get('platform');
            var spec = {
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
            };

            params.id = params.itemId;
            delete params.itemId;

            this.app.fetch(spec, {
                readFromCache: false
            }, function afterFetch(err, result) {
                if (err || !result.item) {
                    return helpers.common.redirect.call(this, '/404');
                }

                var item = result.item.toJSON();
                var subcategory;

                if (platform === 'html5') {
                    return helpers.common.redirect.call(this, '/' + params.title + '-iid-' + item.id);
                }
                subcategory = result.categories.search(item.category.id);
                analytics.reset();
                analytics.addParam('item', item);
                analytics.addParam('category', result.categories.get(subcategory.get('parentId')).toJSON());
                analytics.addParam('subcategory', subcategory.toJSON());
                result.analytics = analytics.generateURL.call(this);
                result.user = user;
                result.item = item;
                result.form = form;
                callback(err, result);
            }.bind(this));
        }
    },
    success: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var user = this.app.session.get('user');
            var spec = {
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
            };

            params.id = params.itemId;
            delete params.itemId;

            this.app.fetch(spec, {
                readFromCache: false
            }, function afterFetch(err, result) {
                if (err || !result.item) {
                    return helpers.common.redirect.call(this, '/404');
                }

                var item = result.item.toJSON();
                var subcategory;

                subcategory = result.categories.search(item.category.id);

                analytics.reset();
                analytics.addParam('item', item);
                analytics.addParam('category', result.categories.get(subcategory.get('parentId')).toJSON());
                analytics.addParam('subcategory', subcategory.toJSON());
                result.analytics = analytics.generateURL.call(this);
                result.user = user;
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
