'use strict';

var Item = require('../models/item');
var Base = require('./base');

module.exports = Base.extend({
    model: Item,
    url: function() {
        var user = this.app.session.get('user') || {};
        var url;

        switch(this.params.item_type) {
            case 'adsList':
                url = '/items';
            break;
            case 'myAds':
                url = '/users/'+ user.userId +'/items';
            break;
            case 'favorites':
                url = '/users/'+ user.userId +'/favorites';
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
