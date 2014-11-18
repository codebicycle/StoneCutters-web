'use strict';

var _ = require('underscore');
var utils = require('../../../../shared/utils');
var config = require('../config');
var filters = utils.get(adx, ['ADX'], {});

function initialize(models, options) {
}

function pepe(name) {
    return 'hola' + name;
}

module.exports = Base.extend({
    pepe: pepe
});

module.exports.id = 'Adserving';