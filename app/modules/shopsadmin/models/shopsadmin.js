'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var ShopsAdmin;
var Base;

Backbone.noConflict();
Base = Backbone.Model;

function setShops(options) {
    this.set({"shops": options, "idx": 0});
}

function getShop() {
    var idx = this.get("idx");
    var shops = this.get("shops");
    var shop;
    if (Math.floor((Math.random() * 100) + 1) < 15) {
        shop = shops[idx];
        idx++;

        this.set({"shops": shops, "idx": idx});
    }

    return shop;
}

module.exports = Base.extend({
    setShops: setShops,
    getShop: getShop
});

module.exports.id = 'ShopsAdmin';
