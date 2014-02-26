'use strict';

var EnvHelper = require('../helpers/env_helper');

module.exports = {
    index: function(params, callback) {
        params.item_type = 'adsList';
        var spec = {
          items: {collection: 'Items', params: params}
        };
        var platform = this.app.get('baseData').platform;
        EnvHelper.setUrlVars(this.app);

        /** don't read from cache, because rendr caching expects an array response
        with ids, and smaug returns an object with 'data' and 'metadata' */
        this.app.fetch(spec, {
            'readFromCache': false
        }, function afterFetch(err, result) {
            result.items = result.items.models[0].get('data');
            result.platform = platform;
            callback(err, result);
        });
    },
    show: function(params, callback) {
        var spec = {
            item: {
                model: 'Item',
                params: params
            }
        };
        var platform = this.app.get('baseData').platform;
        var siteLocation = this.app.get('baseData').siteLocation;
        EnvHelper.setUrlVars(this.app);
        this.app.fetch(spec, {
            'readFromCache': false
        }, function afterFetch(err, result) {
            result.platform = platform;
            result.location = siteLocation;
            result.item = result.item.toJSON();
            callback(err, result);
        });
    },
    search: function(params, callback) {
        params.item_type = 'adsList';
        params.searchTerm = params.q;
        delete params.q;
        var spec = {
            items: {
                collection: 'Items',
                params: params
            }
        };
        EnvHelper.setUrlVars(this.app);

        //don't read from cache, because rendr caching expects an array response
        //with ids, and smaug returns an object with 'data' and 'metadata'
        this.app.fetch(spec, {
            'readFromCache': false
        }, function afterFetch(err, result) {
            result.metadata = result.items.models[0].get('metadata');
            result.items = result.items.models[0].get('data');
            result.searchTerm = params.searchTerm;
            callback(err, result);
        });
    }
};
