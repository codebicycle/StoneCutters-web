'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var config = require('../../../shared/config');
var utils = require('../../../shared/utils');
var Base;

Backbone.noConflict();
Base = Backbone.Model;

function initialize(attrs, options) {
    this.app = options.app;
}

function isPlatformEnabled(platforms) {
    var enabled = true;

    if (platforms && !_.contains(platforms, this.app.session.get('platform'))) {
        enabled = false;
    }
    return enabled;
}

function isEnabled() {
    var location = this.app.session.get('location');
    var enabled = config.getForMarket(location.url, ['validator', 'email', 'enabled'], false);

    if (enabled) {
        enabled = isPlatformEnabled.call(this, config.getForMarket(location.url, ['validator', 'email', 'platforms']));
    }
    return enabled;
}

function run(options) {
    var element = this.get('element');

    options = _.defaults({}, options || {}, {
        key: config.getForMarket(this.app.session.get('location').url, ['validator', 'email', 'key']),
        progress: this.get('progress') || utils.noop,
        success: this.get('success') || utils.noop,
        error: this.get('error') || utils.noop,
        always: this.get('always') || utils.noop
    });

    element.mailgun_validator({
       api_key: options.key,
       in_progress: options.progress,
       success: options.success,
       error: options.error,
       always: options.always
    });
}

module.exports = Base.extend({
    initialize: initialize,
    isEnabled: isEnabled,
    run: run
});
