'use strict';

var _ = require('underscore');
var utils = require('../../shared/utils');
var DEPLOY = _.extend(require('./build'), require('./version'));

module.exports = function(environment) {
    var config = './default' + (environment !== 'production' ? ('-' + environment) : '');
    var CONFIG = _.extend(require(config), {
        deploy: DEPLOY
    });

    function get(keys, defaultValue) {
        return utils.get(CONFIG, keys, defaultValue);
    }

    return {
        get: get
    };
};
