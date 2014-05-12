'use strict';

var City = require('../models/city');
var Base = require('./base');

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
