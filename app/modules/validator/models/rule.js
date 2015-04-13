'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
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

function exec(val, $field, validation, options) {
    if (this.has('pattern')) {
        return this.get('pattern').test(val);
    }
    else if (this.has('fn')) {
        return this.get('fn')(val, $field, validation);
    }
    else if (this.has('mailgun') && this.get('mailgun').isEnabled()) {
        return this.resolveFailed(this.get('mailgun').run(options.mailgun || {}));
    }
    return true;
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
