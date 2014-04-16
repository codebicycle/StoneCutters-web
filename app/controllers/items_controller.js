'use strict';

var helpers = require('../helpers');
var _ = require('underscore');
var querystring = require('querystring');
var config = require('../config');

function prepareParams(app, params) {
    var max = config.get(['smaug', 'maxPageSize'], 50);
    if (!params.pageSize || (params.pageSize < 1 || params.pageSize > max)) {
        params.pageSize = max;
    }

    params.item_type = 'adsList';
    params.location = app.getSession('siteLocation');

    params.page = (params.page ? Number(params.page) : 1);
    params.offset = (params.page - 1) * 50;

    var sorts = ['-sort_date_to_showdesc', '-sort_price', '-sort_pricedesc'];
    params.searchOrder = (params.sort && !~sorts.indexOf(params.sort)) ? '' : params.sort;
    params.searchOrder = (params.searchOrder ? params.searchOrder.substr(6) : '');
    delete params.sort;
}

function prepareURLParams(query, url, offset) {
    return (url + '-p-' + (query.page + offset) + query.searchOrder);
}

function preparePaginationLink(metadata, query, url) {
    if (metadata.total > 0) {
        query.searchOrder = (query.searchOrder ? ('/-sort_' + query.searchOrder) : query.searchOrder);
        var next = metadata.next;
        if (next) {
            metadata.next = prepareURLParams(query, url, 1);
        }
        if (query.page > 1) {
            metadata.previous = prepareURLParams(query, url, -1);
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
        var query;

        prepareParams(app, params);
        query = _.clone(params);

        params.categoryId = params.catId;
        delete params.catId;
        delete params.title;
        delete params.page;

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
            preparePaginationLink(result.metadata, query, url);
            callback(err, result);
        });
    },
    show: function(params, callback) {
        var app = helpers.environment.init(this.app);
        var user = app.getSession('user');
        var spec = {
            item: {
                model: 'Item',
                params: params
            }
        };

        if (user) {
            params.token = user.token;
        }

        params.id = params.itemId;
        delete params.itemId;
        delete params.title;

        app.fetch(spec, {
            'readFromCache': false
        }, function afterFetch(err, result) {
            result.platform = app.getSession('platform');
            result.template = app.getSession('template');
            result.location = app.getSession('siteLocation');
            result.user = user;
            result.item = result.item.toJSON();
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
        var query;

        prepareParams(app, params);
        query = _.clone(params);

        params.searchTerm = params.search;
        delete params.search;
        delete params.page;

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
