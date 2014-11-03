'use strict';

var _ = require('underscore');

module.exports = {
    _getStoreKey: function(collectionName, params) {
        var underscored = this.modelUtils.underscorize(collectionName);

        return underscored + ":" + JSON.stringify(sortParams(_.omit(params || {}, 'app', 'params', 'platform', 'parse')));
    }
};

function sortParams(params) {
    var sorted = {};

    _.chain(params).keys().sort().forEach(function(key) {
        sorted[key] = params[key];
    });
    return sorted;
}
