'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../shared/utils');
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
    else if (this.has('mailgun') && this.get('mailgun').isEnabled()) {
        options.mailgun = options.mailgun || {};
        mailgun = this.get('mailgun');
        success = mailgun.get('success') || options.mailgun.success || utils.noop;
        error = mailgun.get('error') || options.mailgun.error || utils.noop;

        return mailgun.run(_.extend({}, options.mailgun, {
            success: function success(data) {
                callback(data.is_valid);
                this.resolveFailed(data);
                success(data);
            }.bind(this),
            error: function error() {
                callback(true);
                this.resolveFailed();
                error();
            }.bind(this)
        }));
    }
    callback(true);
}

function resolveFailed(failed) {
    var mailgun = this.get('mailgun');
    var data;

    if (mailgun && mailgun.isEnabled()) {
        data = mailgun.get('data');
        this.set({
            message: data.did_you_mean ? this.get('messageDidYouMean') : this.get('message')
        });
        return !data.is_valid;
    }
    return failed;
}

module.exports = Base.extend({
    initialize: initialize,
    exec: exec,
    resolveFailed: resolveFailed
});
