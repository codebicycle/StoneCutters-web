'use strict';

var _ = require('underscore');
var Super = require('rendr/shared/store/memory_store');
var cache = {};

module.exports = {
    type: 'model',
    set: function(model) {
        var id = model.storeKey ? model.storeKey() : model.get(model.idAttribute);
        var modelName = this.modelUtils.modelName(model.constructor);
        var key;

        if (!modelName) {
          throw new Error('Undefined modelName for model');
        }
        key = this._getModelStoreKey(modelName, id);
        return Super.prototype.set.call(this, key, model);
    },
    _set: function(key, data) {
        if (typeof window === 'undefined') {
            return;
        }
        this.cache = cache;
        this.cache[this._formatKey(key)] = data;
    }
};
