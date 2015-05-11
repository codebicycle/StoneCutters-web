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
    var enabled = config.getForMarket(location.url, ['tracking', 'trackers', 'mixpanel', 'enabled'], false);

    if (enabled) {
        enabled = isPlatformEnabled.call(this, config.getForMarket(location.url, ['tracking', 'trackers', 'mixpanel', 'platforms']));
    }
    return enabled;
}

function getParams() {
    return utils.get(configTracking, ['mixpanel', 'enviroment', config.get(['environment', 'type'])], []);
}

function track(eventName, properties) {
    if (utils.isServer || !window.mixpanel || !eventName) {
        return;
    }
    var location = this.app.session.get('location');
    var userStatus = !!this.app.session.get('user');

    _.extend(properties, {
        '$city': 'Lanus',
        'Logged in' : +userStatus
    });
    console.log(properties, this.app.session.get('shortHost'));
    //window.mixpanel.track(eventName, properties || {});
}

module.exports = {
    isEnabled: isEnabled,
    getParams: getParams,
    track: track
};
