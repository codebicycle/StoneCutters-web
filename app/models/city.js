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
    parse: function(response) {
        if (response.children && response.children[0] && response.children[0].children && response.children[0].children[0]) {
            return response.children[0].children[0];
        }
        return response;
    }
});

module.exports.id = 'City';
