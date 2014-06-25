'use strict';

var Base = require('../bases/model');

module.exports = Base.extend({
    url: '/countries/:location/categories/:id',
    idAttribute: 'id',
    parse: function(result) {
        var Collection = require('../collections/categories');

        result.children = new Collection(result.children);
        return result;
    }
});

module.exports.id = 'Category';
