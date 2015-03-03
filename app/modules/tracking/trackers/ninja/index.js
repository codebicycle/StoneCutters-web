'use strict';

var _ = require('underscore');
var config = require('../../../../../shared/config');
var params = require('./params');
var env = config.get(['environment', 'type'], 'production');

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

function getParams(page, options) {
    var _params = params.get.apply(this, arguments);
    var config = getConfig.apply(this, arguments);

    return {
        params: _params,
        config: config
    };
}

function getConfig(page, options) {
    var location = this.app.session.get('location');
    var config = {
        siteUrl: location.url
    };

    if (env !== 'production') {
        config.environment = 'testing';
    }
    return config;
}

module.exports = {
    isEnabled: isEnabled,
    getParams: getParams,
    getConfig: getConfig
};
