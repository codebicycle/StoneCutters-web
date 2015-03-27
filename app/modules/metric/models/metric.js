'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var statsd = require('../../../../shared/statsd')();

Backbone.noConflict();

function initialize(attrs, options) {
    this.app = options.app;
}

function increment(values, options) {
    this.incrementGraphite(values, options);
}

function incrementGraphite(values, options) {
    var metric = [this.app.session.get('location').abbreviation];

    if (_.isArray(values)) {
        values = _.object(['category', 'action', 'value'], values);
    }
    values = values || {};

    if (values.category) {
        metric.push(values.category);
    }
    if (values.action) {
        metric.push(values.action);
    }
    if (values.value) {
        if (_.isArray(values.value)) {
            metric = metric.concat(values.value);
        }
        else {
            metric.push(values.value);
        }
    }
    metric.push(this.app.session.get('platform'));
    statsd.increment(metric, options);
}

function getListingType() {
    var currentRoute = this.app.session.get('currentRoute');
    var type = 'browse';

    if (currentRoute.controller === 'searches' && _.contains(['filter', 'filterig', 'search', 'searchig'], currentRoute.action)) {
        type = 'search';
    }
    return type;
}

module.exports = Backbone.Model.extend({
    initialize: initialize,
    increment: increment,
    incrementGraphite: incrementGraphite,
    getListingType: getListingType
});

