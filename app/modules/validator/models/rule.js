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
        return callback(this.get('pattern').test(val));
    }
    else if (this.has('fn')) {
        return callback(this.get('fn')(val, validation));
    }
    else if (this.has('mailgun')) {
        options.mailgun = options.mailgun || {};
        mailgun = this.get('mailgun');
        succeeded = mailgun.get('success') || options.mailgun.success || utils.noop;
        failed = mailgun.get('error') || options.mailgun.error || utils.noop;

        return mailgun.run(_.extend({}, options.mailgun, {
            success: function success(data) {
                resolveMessage.call(this, data, options);
                callback(options.isSubmit ? data.is_valid : data.is_valid && !data.did_you_mean);
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
        className = (!data.is_valid ? 'error ' : '') + 'message did_you_mean';
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
