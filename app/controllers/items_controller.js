'use strict';

var helpers = require('../helpers');
var _ = require('underscore');
var asynquence = require('asynquence');

module.exports = {
    show: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var app = this.app;
            var user = app.getSession('user');
            var securityKey = params.sk;
            var itemId = params.itemId;
            var slugUrl = params.title;
            var siteLocation = app.getSession('siteLocation');
            var anonymousItem;
            var spec;

            helpers.seo.resetHead();

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
            delete params.itemId;
            delete params.title;
            delete params.sk;

            spec = {
                item: {
                    model: 'Item',
                    params: params
                }
            };

            app.fetch(spec, {
                'readFromCache': false
            }, function afterFetch(err, result) {
                if (err) {
                    return helpers.common.redirect.call(this, '/404');
                }
                findRelatedItems.call(this, err, result);
            }.bind(this));

            function findRelatedItems(err, data) {
                var item = data.item.toJSON();
                var slug;
                var itemLocation;
                var siteLocation;
                var spec;

                if (!item) {
                    return helpers.common.redirect.call(this, '/404');
                }
                slug = helpers.common.slugToUrl(item);
                if (slugUrl && slug.indexOf(slugUrl + '-iid-')) {
                    return helpers.common.redirect.call(this, ('/' + slug));
                }
                itemLocation = item.location.children[0].children[0].url;
                siteLocation = this.app.getSession('siteLocation');
                if (itemLocation.split('.').pop() !== siteLocation.split('.').pop()) {
                    var protocol = app.getSession('protocol');
                    var platform = app.getSession('platform');
                    var host = item.location.url.replace('www', 'm');
                    var url = [protocol, '://', platform, '.', host, '/', slug].join('');

                    return helpers.common.redirect.call(this, url, null, {
                        pushState: false,
                        nolink: itemLocation
                    });
                }
                spec = {
                    items: {
                        collection : 'Items',
                        params: {
                            location: siteLocation,
                            offset: 0,
                            pageSize: 10,
                            relatedAds: itemId
                        }
                    }
                };
                app.fetch(spec, {
                    'readFromCache': false
                }, function afterFetch(err, result) {
                    var model = result.items.models[0];
                    var user = app.getSession('user');
                    var categoryTree;
                    var title;
                    var description;

                    result.relatedItems = model.get('data');
                    result.user = user;
                    result.item = item;
                    result.pos = Number(params.pos) || 0;
                    result.sk = securityKey;
                    categoryTree = helpers.categories.getTree(app, item.category.id);
                    helpers.analytics.reset();
                    helpers.analytics.addParam('user', user);
                    helpers.analytics.addParam('item', item);
                    helpers.analytics.addParam('category', categoryTree.parent);
                    helpers.analytics.addParam('subcategory', categoryTree.subCategory);
                    result.analytics = helpers.analytics.generateURL(app.getSession());
                    result.relatedAdsLink = '/' + helpers.common.slugToUrl(categoryTree.subCategory) + '?relatedAds=' + itemId;

                    title = helpers.seo.shortTitle(item.title, item.location.children[0].children[0].name);
                    description = helpers.seo.shortDescription(item.title, item.description, item.category.name, item.location.children[0].children[0].name);
                    helpers.seo.addMetatag('title', title);
                    helpers.seo.addMetatag('Description', description);
                    helpers.seo.addMetatag('canonical', ['http://', siteLocation, '/', slug].join(''));
                    helpers.seo.update();

                    callback(err, result);
                });
            }
        }
    },
    galery: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var app = this.app;
            var user = app.getSession('user');
            var itemId = params.itemId;
            var slugUrl = params.title;
            var pos = Number(params.pos) || 0;
            var siteLocation = app.getSession('siteLocation');
            var spec;
            var slug;

            if (user) {
                params.token = user.token;
            }
            params.id = params.itemId;
            delete params.itemId;
            delete params.title;

            spec = {
                item: {
                    model: 'Item',
                    params: params
                }
            };
            app.fetch(spec, {
                'readFromCache': false
            }, function afterFetch(err, result) {
                var item = result.item.toJSON();
                var categoryTree;

                if (!item) {
                    return helpers.common.redirect.call(this, '/404');
                }
                slug = helpers.common.slugToUrl(item);
                if (slugUrl && slug.indexOf(slugUrl + '-iid-')) {
                        return helpers.common.redirect.call(this, ('/' + slug));
                    }
                }
                if (!item.images || !item.images.length) {
                    return helpers.common.redirect.call(this, ('/' + slug));
                }
                if (pos < 0 || pos >= item.images.length) {
                    return helpers.common.redirect.call(this, ('/' + slug + '/galery'));
                }

                result.item = item;
                result.user = user;
                result.pos = pos;
                categoryTree = helpers.categories.getTree(app, item.category.id);
                helpers.analytics.reset();
                helpers.analytics.addParam('user', user);
                helpers.analytics.addParam('item', item);
                helpers.analytics.addParam('category', categoryTree.parent);
                helpers.analytics.addParam('subcategory', categoryTree.subCategory);
                result.analytics = helpers.analytics.generateURL(app.getSession());
                callback(err, result);
            }.bind(this));
        }
    },
    search: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var page = params ? params.page : undefined;
            var app = this.app;
            var spec = {
                items: {
                    collection: 'Items',
                    params: params
                }
            };
            var user = app.getSession('user');
            var siteLocation = app.getSession('siteLocation');
            var query;

            helpers.pagination.prepare(app, params);
            query = _.clone(params);
            delete params.search;
            delete params.page;
            delete params.filters;
            delete params.urlFilters;

            helpers.seo.resetHead();
            helpers.seo.addMetatag('canonical', ['http://', siteLocation, '/nf/search/', query.search, (query.page && query.page > 1 ? '/-p-' + query.page : '')].join(''));

            helpers.analytics.reset();
            helpers.analytics.setPage('nf');
            helpers.analytics.addParam('keyword', query.search);
            helpers.analytics.addParam('page_nb', 0);
            helpers.analytics.addParam('user', user);

            if (!query.search || _.isEmpty(query.search.trim())) {
                helpers.seo.addMetatag('robots', 'noindex, nofollow');
                return callback(null, {
                    analytics: helpers.analytics.generateURL(app.getSession()),
                    search: '',
                    metadata: {
                        total: 0
                    }
                });
            }

            //don't read from cache, because rendr caching expects an array response
            //with ids, and smaug returns an object with 'data' and 'metadata'
            app.fetch(spec, {
                'readFromCache': false
            }, function afterFetch(err, result) {
                var protocol = app.getSession('protocol');
                var host = app.getSession('host');
                var url = (protocol + '://' + host + '/nf/search/' + query.search + '/');
                var model = result.items.models[0];

                result.items = model.get('data');
                result.metadata = model.get('metadata');
                if (typeof page !== 'undefined' && (isNaN(page) || page <= 1 || page >= 999999  || !result.items.length)) {
                    return helpers.common.redirect.call(this, '/nf/search/' + query.search);
                }
                if (result.metadata.total < 5){
                    helpers.seo.addMetatag('robots', 'noindex, nofollow');
                    helpers.seo.update();
                }

                helpers.pagination.paginate(result.metadata, query, url);
                helpers.analytics.addParam('page_nb', result.metadata.totalPages);
                result.analytics = helpers.analytics.generateURL(app.getSession());
                result.search = query.search;
                callback(err, result);
            }.bind(this));
        }
    },
    reply: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller(form) {
            var app = this.app;
            var user = app.getSession('user');
            var spec = {
                item: {
                    model: 'Item',
                    params: params
                }
            };

            params.id = params.itemId;
            delete params.itemId;

            app.fetch(spec, {
                'readFromCache': false
            }, function afterFetch(err, result) {
                var categoryTree;
                var item;

                if (err) {
                    return helpers.common.redirect.call(this, '/404');
                }
                item = result.item.toJSON();
                categoryTree = helpers.categories.getTree(app, item.category.id);

                helpers.analytics.reset();
                helpers.analytics.addParam('item', item);
                helpers.analytics.addParam('category', categoryTree.parent);
                helpers.analytics.addParam('subcategory', categoryTree.subCategory);
                result.analytics = helpers.analytics.generateURL(app.getSession());
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
            var app = this.app;
            var user = app.getSession('user');
            var spec = {
                item: {
                    model: 'Item',
                    params: params
                }
            };

            params.id = params.itemId;
            delete params.itemId;

            app.fetch(spec, {
                'readFromCache': false
            }, function afterFetch(err, result) {
                var categoryTree;
                var item;

                if (err) {
                    return helpers.common.redirect.call(this, '/404');
                }
                item = result.item.toJSON();
                categoryTree = helpers.categories.getTree(app, item.category.id);

                helpers.analytics.reset();
                helpers.analytics.addParam('item', item);
                helpers.analytics.addParam('category', categoryTree.parent);
                helpers.analytics.addParam('subcategory', categoryTree.subCategory);
                result.analytics = helpers.analytics.generateURL(app.getSession());
                result.user = user;
                result.item = item;
                callback(err, result);
            }.bind(this));
        }
    },
    favorite: function(params, callback) {
        var intent = !params.intent || params.intent === 'undefined' ? undefined : params.intent;

        function add(done) {
            var user = this.app.getSession('user') || {};

            helpers.dataAdapter.request('post', '/users/' + user.userId + '/favorites/' + params.itemId + (intent ? '/' + intent : ''), {
                query: {
                    token: user.token
                }
            }, done.errfcb);
        }

        function next(done) {
            helpers.common.redirect.call(this, params.redirect || '/des-iid-' + params.itemId, null, {
                status: 302
            });
        }

        asynquence().or(next.bind(this))
            .then(add.bind(this))
            .val(next.bind(this));
    },
    delete: function(params, callback) {
        var itemId = !params.itemId || params.itemId === 'undefined' ? undefined : params.itemId;

        function remove(done) {
            var user = this.app.getSession('user') || {};

            helpers.dataAdapter.request('post', ('/items/' + itemId + '/delete'), {
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