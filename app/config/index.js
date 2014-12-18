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
        var value = utils.get(CONFIG, keys);

        if (checkValue(value)) {
            value = defaultValue;
            keys = _.clone(utils.toArray(keys));
            if (keys.length) {
                value = utils.get(CONFIG, keys.splice(keys.length - 1, 1, 'default'), defaultValue);
            }
        }
        return value;
    }

    function getForMarket(location, keys, defaultValue) {
        var value = utils.get(MARKETS, [location].concat(keys));

        if (checkValue(value)) {
            value = utils.get(MARKETS, ['emerging'].concat(keys));
        }
        if (checkValue(value)) {
            value = utils.get(MARKETS, ['common'].concat(keys), defaultValue);
        }
        return value;
    }

    function checkValue(value) {
        return value === null || _.isUndefined(value);
    }

    return {
        get: get,
        getForMarket: getForMarket
    };
};
