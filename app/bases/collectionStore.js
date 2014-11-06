'use strict';

var _ = require('underscore');
var utils = require('../../shared/utils');
var cache = {};

module.exports = {
    type: 'collection',
    _getStoreKey: function(collectionName, params) {
        var underscored = this.modelUtils.underscorize(collectionName);

        return underscored + ":" + JSON.stringify(utils.sort(_.omit(params || {}, 'app', 'params', 'platform', 'parse')));
    },
    _set: function(key, data) {
        if (typeof window === 'undefined') {
            return;
        }
        this.cache = cache;
        this.cache[this._formatKey(key)] = data;
    }
};
