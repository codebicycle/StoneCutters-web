'use strict';

var _ = require('underscore');
var cache = {};

module.exports = {
    type: 'collection',
    _getStoreKey: function(collectionName, params) {
        var underscored = this.modelUtils.underscorize(collectionName);

        return underscored + ":" + JSON.stringify(sortParams(_.omit(params || {}, 'app', 'params', 'platform', 'parse')));
    },
    _set: function(key, data) {
        this.cache = cache;
        this.cache[this._formatKey(key)] = data;
    }
};

function sortParams(params) {
    var sorted = {};

    _.chain(params).keys().sort().forEach(function(key) {
        sorted[key] = params[key];
    });
    return sorted;
}
