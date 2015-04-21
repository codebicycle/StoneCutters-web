'use strict';

var _ = require('underscore');
var Metric = require('./models/metric');
var utils = require('../../../shared/utils');
var checkers = {
    currentRoute: checkCurrentRoute,
    location: checkLocation
};

Metric.incrementEventHandler = function incrementEventHandler(event) {
    var $elem = $(event.currentTarget);
    var values = Metric.getValues($elem.data('increment-metric'));
    var options = $elem.data('increment-options');

    if (options) {
        try {
            options = JSON.parse(options);
        } catch(e) {
            options = undefined;
        }
    }
    Metric.increment.call(this, values, _.defaults({}, options || {}, {
        exec: $elem.data('increment-exec'),
        exclude: $elem.data('increment-exclude'),
        include: $elem.data('increment-include')
    }));
};

Metric.increment = function increment(values, options) {
    if (!check.call(this, options || {})) {
        return;
    }
    if (!this.metric) {
        this.metric = new Metric({}, this);
    }
    this.metric.increment(values, options);
};

Metric.getValues = function getValues(values) {
    if (values) {
        try {
            values = JSON.parse(values);
        } catch(e) {
            // Ignore
        }
    }
    if (_.isString(values)) {
        values = values.split('.');
        values = [values.shift(), values.shift(), values];
    }
    if (_.isArray(values)) {
        values = _.object(['category', 'action', 'value'], values);
    }
    return values || {};
};

function check(options) {
    var rule;

    if (options.exec === false || options.exec === 'false') {
        return false;
    }
    rule = options.include;
    if (rule) {
        return checkRule.call(this, rule);
    }
    rule = options.exclude;
    if (rule) {
        return !checkRule.call(this, rule);
    }
    return true;
}

function checkRule(rule) {
    var checker;
    var val;

    rule = rule.split(':');
    checker = checkers[rule.shift()] || utils.noop;
    val = rule.shift();
    try {
        val = JSON.parse(val);
    } catch(e) {
        // Ignore
    }
    return checker.call(this, val);
}

function checkCurrentRoute(value) {
    var currentRoute = _.values(this.app.session.get('currentRoute')).join('#');

    if (_.isArray(value)) {
        return _.contains(value, currentRoute);
    }
    return currentRoute === value;
}

function checkLocation(value) {
    var location = this.app.session.get('location').url;

    if (_.isArray(value)) {
        return _.contains(value, location);
    }
    return location === value;
}

module.exports = Metric;
