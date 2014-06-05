'use strict';

var helpers = require('../helpers');
var _ = require('underscore');
var querystring = require('querystring');
var config = require('../config');

function findFilters(filters) {
    var match = filters.match(/-[a-zA-Z0-9]+_[a-zA-Z0-9_\.]*/g);
    return(match ? match : []);
}

function parseValueFilter(value, filter) {
    if (!~value.indexOf('_')) {
        filter.type = _.contains(['true', 'false'], value) ? 'BOOLEAN' : 'SELECT';
        return value;
    }
    value = value.split('_');
    filter.type = 'RANGE';
    return {
        from: value[0],
        to: value[1]
    };
}

function parseFilter(filter) {
    var keyValue = filter.replace(/-([a-zA-Z0-9]+)_([a-zA-Z0-9_\.]*)/g, '$1#$2');
    keyValue = keyValue.split('#');
    filter = {
        name: keyValue[0]
    };
    filter.value = parseValueFilter(keyValue[1], filter);
    return filter;
}

function prepareFilters(params) {
    var filters = {};
    var listFilters = findFilters(params.filters);

    _.each(listFilters, function parseFilters(filter, i) {
        filter = parseFilter(filter);
        filters[ filter.name ] = filter;
    });
    return filters;
}

function prepareURLFilters(params) {
    var url;
    var sort;
    var filters = params.filters;
    if (!filters) {
        return '';
    }

    url = ['/'];
    if (filters.sort) {
        sort = filters.sort;
        delete filters.sort;
    }
    _.each(filters, function(filter, name) {
        if (filter.value === 'false') {
            return;
        }
        url.push('-');
        url.push(name);
        url.push('_');
        switch(filter.type) {
            case 'SELECT':
                url.push(filter.value);
                params['f.' + name] = filter.value;
                break;
            case 'BOOLEAN':
                url.push(filter.value);
                params['f.' + name] = filter.value;
                break;
            case 'RANGE':
                url.push(filter.value.from);
                url.push('_');
                url.push(filter.value.to);
                params['f.' + name] = filter.value.from + 'TO' + filter.value.to;
                break;
            default:
                break;
        }
    });
    if (sort) {
        url.push('-sort_');
        url.push(sort.value);
        var sortNameValue = sort.value.replace(/([a-zA-Z0-9_]*)(desc)/g, '$1#$2');
        sortNameValue = sortNameValue.split('#');
        params['s.' + sortNameValue[0]] = sortNameValue[1] || 'asc';
    }
    return url.join('');
}

function prepareParams(app, params) {
    var max = config.get(['smaug', 'maxPageSize'], 50);
    if (!params.pageSize || (params.pageSize < 1 || params.pageSize > max)) {
        params.pageSize = max;
    }
    params.item_type = 'adsList';
    params.location = app.getSession('siteLocation');
    params.page = (params.page ? Number(params.page) : 1);
    params.offset = (params.page - 1) * params.pageSize;
    if (params.search) {
        params.searchTerm = params.search;
    }
    if (params.filters) {
        params.filters = prepareFilters(params);
        params.urlFilters = prepareURLFilters(params);
    }
}

function prepareURLParams(query, url, offset, urlFilters) {
    return (url + '-p-' + (query.page + offset) + (urlFilters || '/'));
}

function preparePaginationLink(metadata, query, url) {
    var next;
    var max = config.get(['smaug', 'maxPageSize'], 50);

    metadata.page = query.page;
    metadata.totalPages = Math.floor(metadata.total / max) + ((metadata.total % max) === 0 ? 0 : 1);
    metadata.current = prepareURLParams(query, url, 0, query.urlFilters);
    if (metadata.total > 0) {
        next = metadata.next;
        if (next) {
            metadata.next = prepareURLParams(query, url, 1, query.urlFilters);
        }
        if (query.page > 1) {
            metadata.previous = prepareURLParams(query, url, -1, query.urlFilters);
        }
    }
}

module.exports = {
    index: function(params, callback) {
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
            var category = helpers.categories.getCat(app.getSession(), params.catId);
            var query;
            var slug;

            if (!category) {
                this.redirectTo(helpers.common.link('/', siteLocation), {
                    status: 301
                });
                return;
            }
            slug = helpers.common.slugToUrl(category);
            if (slug.indexOf(params.title + '-cat-')) {
                this.redirectTo(helpers.common.link('/' + slug + '-p-1', siteLocation), {
                    status: 301
                });
                return;
            }

            prepareParams(app, params);
            query = _.clone(params);
            params.categoryId = params.catId;
            delete params.catId;
            delete params.title;
            delete params.page;
            delete params.filters;
            delete params.urlFilters;

            helpers.seo.resetHead();
            helpers.seo.addMetatag('canonical', ['http://', siteLocation, '/', slug, (query.page ? '-p-' + query.page : '')].join(''));

            /** don't read from cache, because rendr caching expects an array response
            with ids, and smaug returns an object with 'data' and 'metadata' */
            app.fetch(spec, {
                'readFromCache': false
            }, function afterFetch(err, result) {
                var protocol = app.getSession('protocol');
                var host = app.getSession('host');
                var url = (protocol + '://' + host + '/' + query.title + '-cat-' + query.catId);
                var model = result.items.models[0];
                var category = helpers.categories.getCat(app.getSession(), query.catId);
                var categoryTree = helpers.categories.getCatTree(app.getSession(), query.catId);

                result.items = model.get('data');
                result.metadata = model.get('metadata');

                preparePaginationLink(result.metadata, query, url);
                helpers.analytics.reset();
                helpers.analytics.setPage('pages');
                helpers.analytics.addParam('category', categoryTree.parent);
                helpers.analytics.addParam('subcategory', categoryTree.subCategory);
                result.analytics = helpers.analytics.generateURL(app.getSession());
                result.category = category;
                callback(err, result);
            });
        }
    },
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
                    result.relatedAdsLink = '/' + helpers.common.slugToUrl(categoryTree.subCategory) + '-p-1?relatedAds=' + itemId;

                    var title = helpers.seo.shortTitle(item.title, item.location.children[0].children[0].name);
                    var description = helpers.seo.shortDescription(item.title, item.description, item.category.name, item.location.children[0].children[0].name);
                    helpers.seo.addMetatag('title', title);
                    helpers.seo.addMetatag('Description', description);
                    helpers.seo.update();

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
            prepareParams(app, params);
            query = _.clone(params);
            delete params.search;
            delete params.page;
            delete params.filters;
            delete params.urlFilters;

            helpers.seo.resetHead();
            helpers.seo.addMetatag('canonical', ['http://', siteLocation, '/nf/search/', query.search, (query.page ? '/-p-' + query.page : '')].join(''));

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
                preparePaginationLink(result.metadata, query, url);
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
