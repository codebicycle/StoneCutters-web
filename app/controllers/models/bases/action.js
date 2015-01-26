'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var asynquence = require('asynquence');
var helpers = require('../../../helpers');
var Action = Backbone.Model.extend({
    initialize: initialize,
    control: control,
    redirection: redirection,
    action: action,
    success: success,
    error: error,
    redirect: redirect
});

function initialize(attrs, options) {
    _.extend(this, options || {});
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
    helpers.common.error.call(this, err || null, res || {}, this.get('callback'));
}

function redirect(url, parameters, options) {
    return helpers.common.redirect.call(this, url, parameters, options);
}

module.exports = Action;
