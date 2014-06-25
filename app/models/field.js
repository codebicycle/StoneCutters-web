'use strict';

var Base = require('../bases/model');

module.exports = Base.extend({
    url: '/items/fields/:id',
    idAttribute: 'id'
});

module.exports.id = 'Field';
