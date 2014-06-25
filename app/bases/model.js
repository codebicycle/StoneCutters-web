'use strict';

var Base = require('rendr/shared/base/model');
var syncer = require('./syncer');
var _ = require('underscore');

_.extend(Base.prototype, syncer);

module.exports = Base.extend({});
