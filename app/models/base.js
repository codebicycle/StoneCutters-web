'use strict';

var RendrBase = require('rendr/shared/base/model');
var syncer = require('../syncer');
var _ = require('underscore');

_.extend(RendrBase.prototype, syncer);

module.exports = RendrBase.extend({});
