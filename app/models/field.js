'use strict';

var Base = require('./base');
var _ = require('underscore');

module.exports = Base.extend({
    url: '/items/fields/:id',
    idAttribute: 'id'
});

module.exports.id = 'Field';
