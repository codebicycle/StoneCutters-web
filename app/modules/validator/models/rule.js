'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../../shared/utils');
var templateSettings = {
    interpolate: /\{(.+?)\}/g,
    evaluate: /\{\=(.+?)\}/g,
    escape: /\{\-(.+?)\}/g
};
var Base;

Backbone.noConflict();
Base = Backbone.Model;

function initialize(attrs, options) {
    this.options = options || {};
    this.app = this.options.app;
    if (this.options.events) {
        _.each(this.options.events, function each(event, name) {
            this.on(name, event, this);
        }, this);
    }
    if (attrs.mailgun) {
        this.set('messageError', attrs.message);
    }
}

function exec(val, validation, options, callback) {
    var mailgun;
    var success;
    var error;

    if (this.has('pattern')) {
        return callback(this.get('pattern').test(val));
    }
    else if (this.has('fn')) {
        return callback(this.get('fn')(val, validation));
    }
    else if (this.has('mailgun')) {
        options.mailgun = options.mailgun || {};
        mailgun = this.get('mailgun');
        success = mailgun.get('success') || options.mailgun.success || utils.noop;
        error = mailgun.get('error') || options.mailgun.error || utils.noop;

        return mailgun.run(_.extend({}, options.mailgun, {
            success: function success(data) {
                callback(data.is_valid);
                this.resolveMessage(data);
                success(data);
            }.bind(this),
            error: function error() {
                callback(true);
                this.resolveMessage();
                error();
            }.bind(this)
        }));
    }
    callback(true);
}

function resolveMessage(data) {
    var mailgun = this.get('mailgun');
    var message = this.get('messageError');

    if (data && data.did_you_mean) {
        message = this.get('messageDidYouMean');
        message = _.template(message, data, templateSettings);
    }
    this.set({
        message: message
    });
}

module.exports = Base.extend({
    initialize: initialize,
    exec: exec
});
