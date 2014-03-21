'use strict';

var Base = require('./base');

module.exports = Base.extend({
    url: '/items/fields/:id',
    idAttribute: 'id'
});

module.exports.id = 'Field';
