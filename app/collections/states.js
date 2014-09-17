'use strict';

var Base = require('../bases/collection');
var State = require('../models/state');

module.exports = Base.extend({
    model: State,
    url: '/countries/:location/states'
});

module.exports.id = 'States';
