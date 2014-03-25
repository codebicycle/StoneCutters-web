'use strict';

var Item = require('../models/item');
var Base = require('./base');
var querystring = require('querystring');

module.exports = Base.extend({
    model: Item,
    url: function() {
        var url;

        switch(this.params.item_type) {
            case 'adsList':
                url = '/items';
            break;
            case 'myAds':
                url = '/users/'+this.Storage.get('userObj').userId+'/items';
            break;
            case 'myFavorites':
                url = '/users/'+this.Storage.get('userObj').userId+'/favorites';
            break;
            default:
                url = '/items';
            break;
        }
        if (this.params) {
            url += '?';
            for (var param in this.params) {
                url += param + '=:' + param + '&';
            }
            url = url.slice(0, url.length - 1);
        }
        return url;
    }
});

module.exports.id = 'Items';
