'use strict';

var Backbone = require('backbone');
var statsd = require('../../../../shared/statsd')();

Backbone.noConflict();

function initialize(attrs, options) {
    this.app = options.app;
}

function increment(values, options) {
    var metric = [this.app.session.get('location').abbreviation];

    values = values || {};

    if (values.category) {
        metric.push(values.category);
    }
    if (values.action) {
        metric.push(values.action);
    }
    if (values.value) {
        metric.push(values.value);
    }
    metric.push(this.app.session.get('platform'));
    statsd.increment(metric, options);
}

module.exports = Backbone.Model.extend({
    initialize: initialize,
    increment: increment
});

