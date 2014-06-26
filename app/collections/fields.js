'use strict';

var Base = require('../bases/collection');
var Field = require('../models/field');

module.exports = Base.extend({
    model: Field,
    url: '/items/fields'
});

module.exports.id = 'Fields';
