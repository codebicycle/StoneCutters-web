'use strict';

var Base = require('../bases/collection');
var City = require('../models/city');

module.exports = Base.extend({
    model: City,
    url: function() {
        var url = '/countries/' + this.params.location + '/cities';

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
        this.metadata = response.metadata;
        return response.data;
    }
});

module.exports.id = 'Cities';
