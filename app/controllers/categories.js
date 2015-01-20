'use strict';

var Categories = require('./models/categories');
var middlewares = require('../middlewares');

module.exports = {
    list: middlewares(list),
    show: middlewares(show),
    showig: middlewares(showig)
};
