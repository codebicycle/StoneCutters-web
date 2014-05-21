'use strict';

var RendrBase = require('rendr/shared/base/collection');
var syncer = require('../syncer');
var _ = require('underscore');
var _parse = RendrBase.prototype.parse;

_.extend(RendrBase.prototype, syncer);

module.exports = RendrBase.extend({
  parse: function(body) {
    if (body && body.itemProperties === null){
        body.itemProperties = {};
    }
    return _parse.apply(this, arguments);
  }
});
