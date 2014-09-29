'use strict';

var Base = require('../bases/collection');
var Item = require('../models/item');

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
            case 'staticSearch': //@TODO Only for test!! url must be '/items/statis'
                url = '/items';
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
            return response.data;
        }
        else {
            console.log('[OLX_DEBUG] Empty item listing response');
            this.metadata = {};
            return [];
        }
    }
});

module.exports.id = 'Items';
