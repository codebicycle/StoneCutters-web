'use strict';

var Base = require('../bases/model');

module.exports = Base.extend({
    idAttribute: 'url',
    url: '/cities/:location/neighborhoods'
});

module.exports.id = 'Neighborhood';
