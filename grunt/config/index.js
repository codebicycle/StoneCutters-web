'use strict';

var _ = require('underscore');
var utils = require('../../shared/utils');
var CONFIG = _.extend({}, require('./default'), {
    translations: require('./translations')
});
var configClient = require('../../shared/config');

module.exports = function() {
    function get(keys, defaultValue) {
        var value = utils.get(CONFIG, keys);

        if (value === null || _.isUndefined(value)) {
            value = configClient.get(keys, defaultValue);
        }
        return value;
    }

    return {
        get: get
    };
}();
