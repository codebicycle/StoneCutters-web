'use strict';

var _ = require('underscore');
var utils = require('../shared/utils');
var CONFIG = _.clone(require('config'));

function get(keys, defaultValue) {
    return utils.get(CONFIG, keys, defaultValue);
}

module.exports = {
    get: get
};
