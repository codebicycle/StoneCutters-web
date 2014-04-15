'use strict';

var helpers = require('../helpers');
var _ = require('underscore');
var querystring = require('querystring');
var config = require('../config');

function checkPageSize(query) {
    var max = config.get(['smaug', 'maxPageSize'], 50);
    if (!query.pageSize || (query.pageSize < 1 || query.pageSize > max)) {
        query.pageSize = max;
    }
}

function prepareParams(params) {
    var max = config.get(['smaug', 'maxPageSize'], 50);
    if (!params.pageSize || (params.pageSize < 1 || params.pageSize > max)) {
        params.pageSize = max;
    }

    params.page = (params.page ? Number(params.page.replace(/.*-p-([\d]*)/, '$1')) : 1);
    params.offset = (params.page - 1) * 50;

    var sorts = ['-sort_date_to_showdesc', '-sort_price', '-sort_pricedesc'];
    if (params.sort && !~sorts.indexOf(params.sort)) {
        params.sort = '';
    }
    params.sort = (params.sort ? params.sort.replace('-sort_', '') : '');
}

function prepareURLParams(query, url, offset) {
    return (url + '-p-' + (query.page + offset) + query.sort);
}

function preparePaginationLink(metadata, query, url) {
    if (metadata.total > 0) {
        query.sort = (query.sort ? ('/-sort_' + query.sort.replace(/(.*)(desc)$/, '$1 $2')) : query.sort);
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
        var query = _.clone(params);
        checkPageSize(params);

        params.item_type = 'adsList';

        /** don't read from cache, because rendr caching expects an array response
        with ids, and smaug returns an object with 'data' and 'metadata' */
        app.fetch(spec, {
            'readFromCache': false
        }, function afterFetch(err, result) {
            var model = result.items.models[0];
            result.items = model.get('data');
            result.metadata = model.get('metadata');
            preparePaginationLink(result.metadata, query, '/items?');
            result.platform = app.getSession('platform');
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
        app.fetch(spec, {
            'readFromCache': false
        }, function afterFetch(err, result) {
            result.platform = app.getSession('platform');
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

        prepareParams(params);
        query = _.clone(params);

        params.item_type = 'adsList';
        params.searchTerm = params.search;
        params.location = app.getSession('siteLocation');
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

        app.fetch(spec, {
            'readFromCache': false
        }, function afterFetch(err, result) {
            result.user = app.getSession('user');
            result.platform = app.getSession('platform');
            result.location = app.getSession('siteLocation');
            result.item = result.item.toJSON();
            callback(err, result);
        });
    }
};
