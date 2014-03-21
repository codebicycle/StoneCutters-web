'use strict';

var Category = require('../models/category');
var Base = require('./base');

module.exports = Base.extend({
    model: Category,
    url: '/countries/:location/categories'
});

module.exports.id = 'Categories';
