'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var config = require('../../../shared/config');
var Base;

Backbone.noConflict();
Base = Backbone.Model;

function initialize(attrs, options) {
    this.app = options.app;
    if (this.isEnabled()) {
        attrs.element.mailgun_validator({
           api_key: config.getForMarket(this.app.session.get('location').url, ['validator', 'email', 'key']),
           in_progress: this.get('progress') || _.noop,
           success: this.get('success') || _.noop,
           error: this.get('error') || _.noop
        });
    }
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

module.exports = Base.extend({
    initialize: initialize,
    isEnabled: isEnabled
});
