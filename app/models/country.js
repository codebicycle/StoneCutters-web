'use strict';

var Base = require('../bases/model');

module.exports = Base.extend({
    idAttribute: 'url',
    url: '/countries/:code',
    parse: function(result) {
        var Collection = require('../collections/countries');

        result.children = new Collection(result.children);
        return result;
    }
});

module.exports.id = 'Country';
