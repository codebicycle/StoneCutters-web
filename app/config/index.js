'use strict';

var _ = require('underscore');
var utils = require('../../shared/utils');
var CONFIG = _.extend(require('./default'), {
    deploy: _.extend(require('./build'), require('./version')),
    analytics: require('./analytics')
});

function get(keys, defaultValue) {
    return utils.get(CONFIG, keys, defaultValue);
}

module.exports = {
    get: get
};
