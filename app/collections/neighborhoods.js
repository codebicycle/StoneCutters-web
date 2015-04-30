'use strict';

var Base = require('../bases/collection');
var Neighborhood = require('../models/neighborhood');

module.exports = Base.extend({
    model: Neighborhood,
    url: '/cities/:location/neighborhoods'
});

module.exports.id = 'Neighborhoods';
