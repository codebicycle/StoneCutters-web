'use strict';

var _ = require('underscore');
var Base = require('../bases/model');

module.exports = Base.extend({
    idAttribute: 'url',
    url: '/countries/:code'
});

module.exports.id = 'Country';
