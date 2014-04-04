'use strict';

var helpers = require('../helpers');
var _ = require('underscore');
var querystring = require('querystring');

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
        var CONFIG = require('../config').smaug;
        function checkPageSize(query) {
            if (query.pageSize > CONFIG.maxPageSize) {
                query.pageSize = CONFIG.maxPageSize;
            }
        }
        checkPageSize(params);

        params.item_type = 'adsList';

        /** don't read from cache, because rendr caching expects an array response
        with ids, and smaug returns an object with 'data' and 'metadata' */
        app.fetch(spec, {
            'readFromCache': false
        }, function afterFetch(err, result) {
            function prepareNextLink(metadata, url) {
                var next = metadata.next;
                if (next) {
                    query.offset = next.replace(/.*offset=(\d*).*/, '\$1');
                    query.pageSize = next.replace(/.*pageSize=(\d*).*/, '\$1');
                    query.sort = next.replace(/.*sort=([\d\w\s]*).*/, '\$1');
                    metadata.next = (url + querystring.stringify(query));
                } else {
                    query.offset = Number(query.offset) + Number(query.pageSize);
                }
                checkPageSize(query);
            }

            function preparePreviousLink(metadata, url) {
                var offset = Number(query.offset);
                var pageSize = Number(query.pageSize);
                offset = (offset - (pageSize * 2));
                if (offset >= 0) {
                    query.offset = offset;
                    metadata.previous = (url + querystring.stringify(query));
                }
            }

            function preparePaginationLink(metadata) {
                var url;
                if (metadata.total > 0) {
                    url = '/items?';
                    prepareNextLink(metadata, url);
                    preparePreviousLink(metadata, url);
                }
             }

            var model = result.items.models[0];
            result.items = model.get('data');
            result.metadata = model.get('metadata');
            preparePaginationLink(result.metadata);
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

        params.token = user.token;
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

        params.item_type = 'adsList';
        params.searchTerm = params.q;
        delete params.q;

        //don't read from cache, because rendr caching expects an array response
        //with ids, and smaug returns an object with 'data' and 'metadata'
        app.fetch(spec, {
            'readFromCache': false
        }, function afterFetch(err, result) {
            var items = result.items.models[0];

            result.metadata = items.get('metadata');
            result.items = items.get('data');
            result.searchTerm = params.searchTerm;
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
