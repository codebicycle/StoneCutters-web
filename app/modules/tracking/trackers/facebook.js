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

function isEnabled(page) {
    var location = this.app.session.get('location');
    var enabled = config.getForMarket(location.url, ['tracking', 'trackers', 'facebook', 'enabled'], true);

    if (enabled) {
        enabled = isPlatformEnabled.call(this, config.getForMarket(location.url, ['tracking', 'trackers', 'facebook', 'platforms']));
    }
    if (enabled) {
        enabled = !!utils.get(configTracking, ['facebook', 'countries', location.url]);
    }
    if (enabled && page) {
        enabled = _.contains(utils.get(configTracking, ['facebook', 'pages'], []), page);
    }
    return enabled;
}

function getParams(page, options) {
    return utils.get(configTracking, ['facebook', 'countries', this.app.session.get('location').url], {});
}

module.exports = {
    isEnabled: isEnabled,
    getParams: getParams
};
