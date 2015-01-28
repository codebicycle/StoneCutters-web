'use strict';

var _ = require('underscore');
var config = require('../../../../../shared/config');
var params = require('./params');

function isPlatformEnabled(platforms) {
    var enabled = true;

    if (platforms && !_.contains(platforms, this.app.session.get('platform'))) {
        enabled = false;
    }
    return enabled;
}

function isEnabled() {
    var location = this.app.session.get('location');
    var enabled = config.getForMarket(location.url, ['tracking', 'trackers', 'ninja', 'enabled'], true);

    if (enabled) {
        enabled = isPlatformEnabled.call(this, config.getForMarket(location.url, ['tracking', 'trackers', 'ninja', 'platforms']));
    }
    return enabled;
}

module.exports = {
    isEnabled: isEnabled,
    getParams: params.get
};
