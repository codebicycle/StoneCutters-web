'use strict';

var helpers = require('../helpers');

module.exports = {
    index: function(params, callback) {
        var app = helpers.environment.init(this.app);
        var spec = {
            items: {
                collection: 'Items',
                params: params
            }
        };

        params.item_type = 'adsList';

        /** don't read from cache, because rendr caching expects an array response
        with ids, and smaug returns an object with 'data' and 'metadata' */
        app.fetch(spec, {
            'readFromCache': false
        }, function afterFetch(err, result) {
            result.items = result.items.models[0].get('data');
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
