'use strict';

var _ = require('underscore');
var configTracking = require('../config');
var config = require('../../../../shared/config');
var utils = require('../../../../shared/utils');
var common = require('./common');

function isPlatformEnabled(platforms) {
    var enabled = true;

    if (platforms && !_.contains(platforms, this.app.session.get('platform'))) {
        enabled = false;
    }
    return enabled;
}

function isEnabled() {
    var location = this.app.session.get('location');
    var enabled = config.getForMarket(location.url, ['tracking', 'trackers', 'tagmanager', 'enabled'], true);

    if (enabled) {
        enabled = isPlatformEnabled.call(this, config.getForMarket(location.url, ['tracking', 'trackers', 'tagmanager', 'platforms']));
    }
    if (enabled) {
        enabled = !!utils.get(configTracking, ['tagmanager', location.url]);
    }
    return enabled;
}

function getParams(page, options) {
    var params = utils.get(configTracking, ['tagmanager', this.app.session.get('location').url], {});

    params.params = [{
        key: 'pageName',
        value: common.getPageName.call(this, page, options)
    }, {
        key: 'iid',
        value: options.item ? options.item.id : ''
    }, {
        key: 'uid',
        value: options.item ? (options.item.user ? options.item.user.id : '') : ''
    }, {
        key: 'emailh',
        value: ''
    }];
    return params;
}

module.exports = {
    isEnabled: isEnabled,
    getParams: getParams
};
