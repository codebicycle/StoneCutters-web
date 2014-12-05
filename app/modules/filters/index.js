'use strict';

var config = require('./config');
var Filters = require('./collections/filters');
var utils = require('../../../shared/utils');

Filters.sorts = function sorts() {
    return utils.get(config, ['sorts'], {});
};

module.exports = Filters;
