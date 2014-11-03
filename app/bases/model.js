'use strict';

var Base = require('rendr/shared/base/model');
var syncer = require('./syncer');
var _ = require('underscore');

_.extend(Base.prototype, syncer);

module.exports = Base.extend({
    storeKey: function() {
        var options = this.collection ? this.collection.options : this.options;

        return this.get(this.idAttribute) + ':' + JSON.stringify(_.omit(options || {}, 'app', 'params', 'platform', 'parse', this.idAttribute));
    }
});
