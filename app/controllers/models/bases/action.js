'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var asynquence = require('asynquence');
var helpers = require('../../../helpers');
var Action;
var Base;

Backbone.noConflict();
Base = Backbone.Model;

Action = Backbone.Model.extend({
    initialize: initialize,
    control: control,
    redirection: redirection,
    action: action,
    success: success,
    error: error,
    redirect: redirect
});

function initialize(attrs, options) {
    this.currentRoute = options.currentRoute;
    this.app = options.app;
    this.redirectTo = options.redirectTo;
}

function control() {
    asynquence().or(this.error.bind(this))
        .then(this.redirection.bind(this))
        .then(this.action.bind(this))
        .val(this.success.bind(this));
}

function redirection(done) {
    (done || _.noop)();
}

function action(done) {
    (done || _.noop)();
}

function success(data) {
    this.get('callback')(null, data || {});
}

function error(err, res) {
    console.log('ERROR 0', err, err.stack);
    helpers.common.error.call(this, err || null, res || {}, this.get('callback'));
}

function redirect(url, parameters, options) {
    return helpers.common.redirect.call(this, url, parameters, options);
}

module.exports = Action;
