'use strict';

var _ = require('underscore');
var configTracking = require('../config');
var config = require('../../../../shared/config');
var utils = require('../../../../shared/utils');

function isPlatformEnabled(platforms) {
    var enabled = true;

    if (platforms && !_.contains(platforms, this.app.session.get('platform'))) {
        enabled = false;
    }
    return enabled;
}

function isEnabled() {
    var location = this.app.session.get('location');
    var enabled = config.getForMarket(location.url, ['tracking', 'trackers', 'allpages', 'enabled'], true);

    if (enabled) {
        enabled = isPlatformEnabled.call(this, config.getForMarket(location.url, ['tracking', 'trackers', 'allpages', 'platforms']));
    }
    if (enabled) {
        enabled = !!utils.get(configTracking, ['allpages', this.app.session.get('location').url]);
    }
    return enabled;
}

function getParams(page, options) {
    return utils.get(configTracking, ['allpages', this.app.session.get('location').url], {});
}

module.exports = {
    isEnabled: isEnabled,
    getParams: getParams
};
