'use strict';

var _ = require('underscore');
var CONFIG = {
    analytics: require('./analytics'),
    smaug: {
        maxPageSize: 50
    },
    staticAccept: ['css', 'js'],
    imageAccept: ['jpg', 'jpeg', 'png', 'gif', 'ico'],
    environment: {
        type: 'd',
        staticPath: '',
        imagePath: ''
    },
    revision: '32ABFE1E'
};

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
