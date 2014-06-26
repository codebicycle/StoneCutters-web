'use strict';

var Base = require('../bases/model');

module.exports = Base.extend({
    url: '/items/:id',
    idAttribute: 'id'
});

module.exports.id = 'Item';
