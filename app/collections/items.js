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
            default:
                url = '/items';
            break;
        }
        return url;
    },
    parse: function(response) {
        this.metadata = response.metadata;
        return response.data;
    }
});

module.exports.id = 'Items';
