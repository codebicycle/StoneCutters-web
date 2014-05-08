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

    metadata.page = query.page;
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
        var app = helpers.environment.init(this.app);
        var spec = {
            items: {
                collection: 'Items',
                params: params
            }
        };
        var session = app.getSession();
        var category = helpers.categories.getCat(session, params.catId);
        var parentCategory = (category.parentId ? helpers.categories.getCat(session, category.parentId) : category);
        var query;

        helpers.analytics.reset();
        helpers.analytics.setPage('/description-cat-' + params.catId);
        helpers.analytics.addParam('parentCategory', parentCategory);
        helpers.analytics.addParam('subCategory', (parentCategory ? category : null));

        prepareParams(app, params);
        query = _.clone(params);

        params.categoryId = params.catId;
        delete params.catId;
        delete params.title;
        delete params.page;
        delete params.filters;
        delete params.urlFilters;

        /** don't read from cache, because rendr caching expects an array response
        with ids, and smaug returns an object with 'data' and 'metadata' */
        app.fetch(spec, {
            'readFromCache': false
        }, function afterFetch(err, result) {
            var model = result.items.models[0];
            var protocol = app.getSession('protocol');
            var host = app.getSession('host');
            var url = (protocol + '://' + host + '/' + query.title + '-cat-' + query.catId);

            result.items = model.get('data');
            result.metadata = model.get('metadata');
            result.platform = app.getSession('platform');
            result.template = app.getSession('template');
            result.location = app.getSession('location');
            preparePaginationLink(result.metadata, query, url);
            result.category = category;
            result.analytics = helpers.analytics.generateURL(session);
            callback(err, result);
        });
    },
    show: function(params, callback) {
        var app = helpers.environment.init(this.app);
        var user = app.getSession('user');
        var securityKey = params.sk;
        var siteLocation = app.getSession('siteLocation');
        var spec = {
            item: {
                model: 'Item',
                params: params
            },
            items: {
                collection : 'Items',
                params: {
                    location: siteLocation,
                    offset: 0,
                    pageSize:10,
                    relatedAds: params.itemId
                }
            }
        };
        var anonymousItem;

        if (user) {
            params.token = user.token;
        } else if (typeof window !== 'undefined' && localStorage) {
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
        app.fetch(spec, {
            'readFromCache': false
        }, function afterFetch(err, result) {
            var model = result.items.models[0];
            result.relatedItems = model.get('data');
            result.platform = app.getSession('platform');
            result.template = app.getSession('template');
            result.location = siteLocation;
            result.user = user;
            result.item = result.item.toJSON();
            result.pos = parseInt(params.pos) || 0;
            result.sk = securityKey;
            callback(err, result);
        });
    },
    search: function(params, callback) {
        var app = helpers.environment.init(this.app);
        var spec = {
            items: {
                collection: 'Items',
                params: params
            }
        };
        var category = helpers.categories.getCat(app.getSession(), params.catId);
        var query;

        prepareParams(app, params);
        query = _.clone(params);

        params.searchTerm = params.search;
        delete params.search;
        delete params.title;
        delete params.page;
        delete params.filters;
        delete params.urlFilters;

        //don't read from cache, because rendr caching expects an array response
        //with ids, and smaug returns an object with 'data' and 'metadata'
        app.fetch(spec, {
            'readFromCache': false
        }, function afterFetch(err, result) {
            var model = result.items.models[0];
            var protocol = app.getSession('protocol');
            var host = app.getSession('host');
            var url = (protocol + '://' + host + '/nf/search/' + query.search + '/');

            result.items = model.get('data');
            result.metadata = model.get('metadata');
            preparePaginationLink(result.metadata, query, '/search?');
            result.platform = app.getSession('platform');
            result.template = app.getSession('template');
            preparePaginationLink(result.metadata, query, url);
            result.search = query.search;
            result.category = category;
            callback(err, result);
        });
    },
    reply: function(params, callback) {
        var app = helpers.environment.init(this.app);
        var spec = {
            item: {
                model: 'Item',
                params: params
            }
        };

        params.id = params.itemId;
        delete params.itemId;
        delete params.title;

        app.fetch(spec, {
            'readFromCache': false
        }, function afterFetch(err, result) {
            result.user = app.getSession('user');
            result.platform = app.getSession('platform');
            result.template = app.getSession('template');
            result.location = app.getSession('siteLocation');
            result.item = result.item.toJSON();
            callback(err, result);
        });
    }
};
