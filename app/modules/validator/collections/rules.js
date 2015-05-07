'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var Rule = require('../models/rule');
var Base;

Backbone.noConflict();
Base = Backbone.Collection;

function initialize(models, options) {
    this.options = options || {};
    this.app = this.options.app;
}

module.exports = Base.extend({
    model: Rule,
    initialize: initialize
});