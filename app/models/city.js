'use strict';

var Base = require('./base');

module.exports = Base.extend({
    idAttribute: 'id',
    url: function() {
        var url = '/locations/' + this.attributes.location;

        if (this.params) {
            url += '?';
            for (var param in this.params) {
                url += param + '=:' + param + '&';
            }
            url = url.slice(0, url.length - 1);
        }
        return url;
    },
    parse: function(location) {
        if (location.children && location.children[0]) {
            if (location.children[0].children && location.children[0].children[0]) {
                return location.children[0].children[0];
            }
            return location.children[0];
        }
        return location;
    }
});

module.exports.id = 'City';
