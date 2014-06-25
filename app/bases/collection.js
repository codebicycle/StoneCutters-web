'use strict';

var Base = require('rendr/shared/base/collection');
var syncer = require('./syncer');
var _ = require('underscore');

_.extend(Base.prototype, syncer);

module.exports = Base.extend({
    parse: function(body) {
        if (body && !body.itemProperties) {
            body.itemProperties = {};
        }
        return Base.prototype.parse.apply(this, arguments);
    }
});
