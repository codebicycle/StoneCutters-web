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
    action: action,
    redirect: redirect,
    prepare: prepare,
    success: success,
    error: error
});

function action(params, callback) {
    var promise = asynquence().or(this.error.bind(this));

    promise.then(this.redirect.bind(this));
    promise.then(this.prepare.bind(this));
    promise.val(this.success.bind(this));
}

function redirect(done) {
    (done || _.noop)();
}

function prepare(done) {
    (done || _.noop)();
}

function success(data) {
    var callback = this.get('callback');

    callback(null, data || {});
}

function error(err, res) {
    helpers.common.error.call(this, err, res, this.get('callback'));
}

module.exports = Action;
