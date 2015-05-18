'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var Rule = require('./rule');
var Rules = require('../collections/rules');
var Base;

Backbone.noConflict();
Base = Backbone.Model;

function initialize(attrs, options) {
    this.options = options || {};
    this.app = this.options.app;
    if (attrs && !(attrs.rules instanceof Backbone.Collection)) {
        this.set({
            rules: new Rules([], this.options)
        });
        this.pushRule(attrs.rules);
    }
    if (this.options.events) {
        _.each(this.options.events, function each(event, name) {
            this.on(name, event, this);
        }, this);
    }
}

function getRules() {
    if (!this.has('rules')) {
        this.set({
            rules: new Rules([], this.options)
        });
    }
    return this.get('rules');
}

function val() {
    var $field = this.get('field');

    if ($field.attr('type') === 'checkbox') {
        return $field.is(':checked') ? $field.val() : '';
    }
    return $field.val();
}

function pushRule(rule) {
    if (!_.isArray(rule)) {
        return this.getRules().set(new Rule(_.omit(rule, 'options'), rule.options));
    }
    _.each(rule, this.pushRule, this);
}

module.exports = Base.extend({
    initialize: initialize,
    val: val,
    getRules: getRules,
    pushRule: pushRule
});
