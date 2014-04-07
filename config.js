'use strict';

var _ = require('underscore');
var CONFIG = _.clone(require('config'));

function get(keys, defaultValue) {
    var value;

    if (!Array.isArray(keys)) {
        keys = [keys];
    }
    if (typeof defaultValue === 'undefined') {
        defaultValue = null;
    }
    keys.every(function iterate(key, index) {
        try {
            if (!index) {
                value = CONFIG[key];
            }
            else {
                value = value[key];
            }
        }
        catch (err) {
            value = null;
            return false;
        }
        return true;
    });
    if (typeof value === 'undefined' || value === null) {
        return defaultValue;
    }
    return _.clone(value);
}

module.exports = {
    get: get
};
