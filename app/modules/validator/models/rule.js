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
    var succeeded;
    var failed;

    if (this.has('pattern')) {
        return callback(!!(val || '').match(this.get('pattern')));
    }
    else if (this.has('fn')) {
        return callback(this.get('fn')(val, validation));
    }
    else if (this.has('mailgun')) {
        options.mailgun = options.mailgun || {};
        mailgun = this.get('mailgun');
        succeeded = options.mailgun.success || mailgun.get('success') || utils.noop;
        failed = options.mailgun.error || mailgun.get('error') || utils.noop;

        return mailgun.run(_.extend({}, options.mailgun, {
            success: function success(data) {
                resolveMessage.call(this, data);
                callback(data.is_valid, !!data.did_you_mean);
                succeeded(data);
            }.bind(this),
            error: function error() {
                resolveMessage.call(this);
                callback(true);
                failed();
            }.bind(this)
        }));
    }
    callback(true);
}

function resolveMessage(data) {
    var mailgun = this.get('mailgun');
    var message = this.get('messageError');
    var className = 'error message';

    if (data && data.did_you_mean) {
        message = this.get('messageDidYouMean');
        message = _.template(message, data, templateSettings);
        className = (!data.is_valid ? 'error ' : 'exclude ') + 'message did-you-mean';
    }
    this.set({
        message: message,
        className: className
    });
}

module.exports = Base.extend({
    initialize: initialize,
    exec: exec
});
