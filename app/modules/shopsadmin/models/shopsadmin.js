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

function getCenter() {
    var minLat = 91;
    var maxLat = -91;
    var minLng = 181;
    var maxLng = -181;

    var shops = this.get("shops");
    for (var j in shops) {
        var shopLocation = shops[j].location;
        if (shopLocation.lat > maxLat) {
            maxLat = shopLocation.lat;
        }
        if (shopLocation.lat < minLat) {
            minLat = shopLocation.lat;
        }
        if (shopLocation.lng > maxLng) {
            maxLng = shopLocation.lng;
        }
        if (shopLocation.lng < minLng) {
            minLng = shopLocation.lng;
        }
    }
    var lat = (maxLat + minLat) / 2;
    var lng = (maxLng + minLng) / 2;
    return JSON.stringify({"lat": lat, "lng": lng});
}

module.exports = Base.extend({
    setShops: setShops,
    getShop: getShop,
    getCenter: getCenter
});

module.exports.id = 'ShopsAdmin';
