'use strict';

var Base = require('../bases/collection');
var City = require('../models/city');

module.exports = Base.extend({
    model: City,
    url: '/:level/:location/:type',
    parse: function(response) {
        if (response.data) {
            this.meta = response.metadata;
            return response.data;
        }
        return response;
    }
});

module.exports.id = 'Cities';
