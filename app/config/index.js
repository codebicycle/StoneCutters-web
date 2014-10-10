'use strict';

var _ = require('underscore');
var utils = require('../../shared/utils');
var DEPLOY = _.extend(require('./build'), require('./version'));
var MARKETS = require('./markets');

module.exports = function(environment) {
    var config = './default' + (environment !== 'production' ? ('-' + environment) : '');
    var CONFIG = _.extend(require(config), {
        deploy: DEPLOY,
        markets: MARKETS
    });

    function get(keys, defaultValue) {
        return utils.get(CONFIG, keys, defaultValue);
    }

    function getForMarket(location, keys, defaultValue) {
        return utils.get(MARKETS, [location].concat(keys)) || utils.get(MARKETS, ['emerging'].concat(keys)) || utils.get(MARKETS, ['common'].concat(keys), defaultValue);
    }

    return {
        get: get,
        getForMarket: getForMarket
    };
};
