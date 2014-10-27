'use strict';

var Base = require('../bases/collection');
var Item = require('../models/item');
var helpers = require('../helpers');
var Filters = require('../modules/filters');

module.exports = Base.extend({
    model: Item,
    url: function() {
        var url;

        switch(this.params.item_type) {
            case 'adsList':
                url = '/items';
            break;
            case 'myAds':
                url = '/users/:userId/items';
            break;
            case 'favorites':
                url = '/users/:userId/favorites';
            break;
            case 'staticSearch':
                url = '/items/static';
            break;
            default:
                url = '/items';
            break;
        }
        return url;
    },
    parse: function(response) {
        if (response) {
            this.metadata = response.metadata;

            if (this.metadata && this.metadata.filters) {
                this.metadata.filters = Filters.prepare(this.metadata.filters);
            }
            return response.data;
        }
        console.log('[OLX_DEBUG] Empty item listing response');
        this.metadata = {};
        return [];
    },
    paginate: function (page, query, url, isGallery) {
        helpers.pagination.paginate(this.metadata, query, url, isGallery);
        if (page !== undefined) {
            if (isNaN(page) || page <= 1) {
                return 1;
            }
            if (page > this.metadata.totalPages) {
                return this.metadata.totalPages;
            }
        }
    }
});

module.exports.id = 'Items';
