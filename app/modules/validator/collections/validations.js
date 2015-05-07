'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var Validation = require('../models/validation');
var Base;

Backbone.noConflict();
Base = Backbone.Collection;

function initialize(models, options) {
    this.options = options || {};
    this.app = this.options.app;
}

module.exports = Base.extend({
    model: Validation,
    initialize: initialize
});