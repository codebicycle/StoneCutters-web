'use strict';

var helpers = require('../helpers');
var _ = require('underscore');

module.exports = {
    show: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var that = this;
            var user = that.app.getSession('user');
            var securityKey = params.sk;
            var itemId = params.itemId;
            var slugUrl = params.title;
            var siteLocation = that.app.getSession('siteLocation');
            var anonymousItem;

            helpers.seo.resetHead();
            helpers.seo.addMetatag('canonical', ['http://', siteLocation, '/', slugUrl, '-iid-', itemId].join(''));

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

            function findItem(next) {
                var spec = {
                    item: {
                        model: 'Item',
                        params: params
                    }
                };

                that.app.fetch(spec, {
                    'readFromCache': false
                }, function afterFetch(err, result) {
                    if (err) {
                        that.redirectTo(helpers.common.link('/404', siteLocation), {
                            status: 301
                        });
                        return;
                    }
                    next(err, result);
                });
            }

            function findRelatedItems(err, data) {
                var item = data.item.toJSON();
                var slug;
                var spec;

                if (!item) {
                    that.redirectTo(helpers.common.link('/404', siteLocation), {
                        status: 301
                    });
                    return;
                }
                slug = helpers.common.slugToUrl(item);
                if (slug.indexOf(slugUrl + '-iid-')) {
                    that.redirectTo(helpers.common.link('/' + slug, siteLocation), {
                        status: 301
                    });
                    return;
                }

                spec = {
                    items: {
                        collection : 'Items',
                        params: {
                            location: siteLocation,
                            offset: 0,
                            pageSize:10,
                            relatedAds: itemId
                        }
                    }
                };
                that.app.fetch(spec, {
                    'readFromCache': false
                }, function afterFetch(err, result) {
                    var model = result.items.models[0];
                    var user = that.app.getSession('user');
                    var categoryTree;

                    result.relatedItems = model.get('data');
                    result.user = user;
                    result.item = item;
                    result.pos = Number(params.pos) || 0;
                    result.sk = securityKey;
                    categoryTree = helpers.categories.getCatTree(that.app.getSession(), item.category.id);
                    helpers.analytics.reset();
                    helpers.analytics.addParam('user', user);
                    helpers.analytics.addParam('item', item);
                    helpers.analytics.addParam('category', categoryTree.parent);
                    helpers.analytics.addParam('subcategory', categoryTree.subCategory);
                    result.analytics = helpers.analytics.generateURL(that.app.getSession());
                    result.relatedAdsLink = '/' + helpers.common.slugToUrl(categoryTree.subCategory) + '?relatedAds=' + itemId;
                    callback(err, result);
                });
            }

            findItem(findRelatedItems);
        }
    },
    galery: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var that = this;
            var user = that.app.getSession('user');
            var securityKey = params.sk;
            var itemId = params.itemId;
            var slugUrl = params.title;
            var siteLocation = that.app.getSession('siteLocation');
            var anonymousItem;

            helpers.seo.resetHead();
            helpers.seo.addMetatag('canonical', ['http://', siteLocation, '/', slugUrl, '-iid-', itemId].join(''));

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

            var spec = {
                item: {
                    model: 'Item',
                    params: params
                }
            };

            that.app.fetch(spec, {
                'readFromCache': false
            }, function afterFetch(err, result) {
                var item = result.item.toJSON();
                var user = that.app.getSession('user');
                var categoryTree;

                result.item = item;
                result.user = user;
                result.pos = Number(params.pos) || 0;
                result.sk = securityKey;
                categoryTree = helpers.categories.getCatTree(that.app.getSession(), item.category.id);
                helpers.analytics.reset();
                helpers.analytics.addParam('user', user);
                helpers.analytics.addParam('item', item);
                helpers.analytics.addParam('category', categoryTree.parent);
                helpers.analytics.addParam('subcategory', categoryTree.subCategory);
                result.analytics = helpers.analytics.generateURL(that.app.getSession());
                callback(err, result);
            });
        }
    },
    search: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var app = this.app;
            var spec = {
                items: {
                    collection: 'Items',
                    params: params
                }
            };
            var siteLocation = app.getSession('siteLocation');
            var query;

            if (!params.search || _.isEmpty(params.search)) {
                this.redirectTo(helpers.common.link('/', siteLocation), {
                    status: 301
                });
                return;
            }
            helpers.pagination.prepare(app, params);
            query = _.clone(params);
            delete params.search;
            delete params.page;
            delete params.filters;
            delete params.urlFilters;

            helpers.seo.resetHead();
            helpers.seo.addMetatag('canonical', ['http://', siteLocation, '/nf/search/', query.search, (query.page && query.page > 1 ? '/-p-' + query.page : '')].join(''));

            //don't read from cache, because rendr caching expects an array response
            //with ids, and smaug returns an object with 'data' and 'metadata'
            app.fetch(spec, {
                'readFromCache': false
            }, function afterFetch(err, result) {
                var user = app.getSession('user');
                var protocol = app.getSession('protocol');
                var host = app.getSession('host');
                var url = (protocol + '://' + host + '/nf/search/' + query.search + '/');
                var model = result.items.models[0];

                result.items = model.get('data');
                result.metadata = model.get('metadata');
                helpers.pagination.paginate(result.metadata, query, url);
                helpers.analytics.reset();
                helpers.analytics.setPage('nf');
                helpers.analytics.addParam('keyword', query.search);
                helpers.analytics.addParam('page_nb', result.metadata.totalPages);
                helpers.analytics.addParam('user', user);
                result.analytics = helpers.analytics.generateURL(app.getSession());
                result.search = query.search;
                callback(err, result);
            });
        }
    },
    reply: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller(form) {
            var that = this;
            var user = that.app.getSession('user');
            var siteLocation = that.app.getSession('siteLocation');
            var spec = {
                item: {
                    model: 'Item',
                    params: params
                }
            };

            params.id = params.itemId;
            delete params.itemId;

            that.app.fetch(spec, {
                'readFromCache': false
            }, function afterFetch(err, result) {
                var categoryTree;
                var item;

                if (err) {
                    that.redirectTo(helpers.common.link('/404', siteLocation), {
                        status: 301
                    });
                    return;
                }
                item = result.item.toJSON();
                categoryTree = helpers.categories.getCatTree(that.app.getSession(), item.category.id);

                helpers.analytics.reset();
                helpers.analytics.addParam('item', item);
                helpers.analytics.addParam('category', categoryTree.parent);
                helpers.analytics.addParam('subcategory', categoryTree.subCategory);
                result.analytics = helpers.analytics.generateURL(that.app.getSession());
                result.user = user;
                result.item = item;
                result.form = form;
                callback(err, result);
            });
        }
    },
    success: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var that = this;
            var user = that.app.getSession('user');
            var siteLocation = that.app.getSession('siteLocation');
            var spec = {
                item: {
                    model: 'Item',
                    params: params
                }
            };

            params.id = params.itemId;
            delete params.itemId;

            that.app.fetch(spec, {
                'readFromCache': false
            }, function afterFetch(err, result) {
                var categoryTree;
                var item;

                if (err) {
                    that.redirectTo(helpers.common.link('/404', siteLocation), {
                        status: 301
                    });
                    return;
                }
                item = result.item.toJSON();
                categoryTree = helpers.categories.getCatTree(that.app.getSession(), item.category.id);

                helpers.analytics.reset();
                helpers.analytics.addParam('item', item);
                helpers.analytics.addParam('category', categoryTree.parent);
                helpers.analytics.addParam('subcategory', categoryTree.subCategory);
                result.analytics = helpers.analytics.generateURL(that.app.getSession());
                result.user = user;
                result.item = item;
                callback(err, result);
            });
        }
    },
};
