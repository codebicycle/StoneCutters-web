'use strict';

var _ = require('underscore');
var configTracking = require('../config');
var config = require('../../../../shared/config');
var utils = require('../../../../shared/utils');

function isPlatformEnabled(platforms) {
    return !(platforms && !_.contains(platforms, this.app.session.get('platform')));
}

function isEnabled() {
    var location = this.app.session.get('location');
    var enabled = config.getForMarket(location.url, ['tracking', 'trackers', 'mixpanel', 'enabled'], true);

    if (enabled) {
        enabled = isPlatformEnabled.call(this, config.getForMarket(location.url, ['tracking', 'trackers', 'mixpanel', 'platforms']));
    }
    return enabled;
}

function getParams() {
    var environment = config.get(['environment', 'type']);
    console.log(environment);
    return utils.get(configTracking, ['mixpanel', 'enviroment', environment], []);
}

module.exports = {
    isEnabled: isEnabled,
    getParams: getParams
};
