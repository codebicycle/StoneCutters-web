'use strict';

var Base = require('../bases/collection');
var Country = require('../models/country');

module.exports = Base.extend({
    model: Country,
    url: '/countries'
});

module.exports.id = 'Countries';
