'use strict';

var Backbone = require('backbone');

Backbone.noConflict();

module.exports = Backbone.Model.extend({
    idAttribute: 'name'
});

module.exports.id = 'Filter';
