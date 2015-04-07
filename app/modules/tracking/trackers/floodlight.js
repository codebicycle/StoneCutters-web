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
    var enabled = config.getForMarket(location.url, ['tracking', 'trackers', 'floodlight', 'enabled'], true);

    if (enabled) {
        enabled = isPlatformEnabled.call(this, config.getForMarket(location.url, ['tracking', 'trackers', 'floodlight', 'platforms']));
    }
    if (enabled) {
        enabled = isValidLocation.call(this, location);
    }
    if (enabled) {
        enabled = !!utils.get(configTracking, ['floodlight', 'section', _.values(this.app.session.get('currentRoute')).join('#')]);
    }
    return enabled;
}

function isValidLocation(location) {
    var level = utils.get(configTracking, ['floodlight', 'level']);
    var ids = utils.get(configTracking, ['floodlight', 'ids']);
    var isValid = false;
    
    if (level === 'country') {
        isValid = true;
    }
    else if (level === 'state') {
        if (location.children && location.children.length && _.contains(ids, location.children[0].id)) {
            isValid = true;
        }
    }
    else if(level === 'city') {
        if (location.children && location.children.length) {
            location = location.children[0];
            if (location.children && location.children.length && _.contains(ids, location.children[0].id)) {
                isValid = true;
            }
        }
    }
    return isValid;
}

function getParams(page, options) {
    var params = {};
    var section = _.values(this.app.session.get('currentRoute')).join('#');

    params.id = utils.get(configTracking, ['floodlight', 'section', section], {});
    params.random = (Math.random() + '') * 10000000000000;
    if (options.category && section === 'categories#show') {
        params.catId = options.category.id;
        if (options.subcategory) {
            params.catId = options.subcategory.id;
        }
    } else {
        params.catId = 0;
    }
    return params;
}

module.exports = {
    isEnabled: isEnabled,
    getParams: getParams
};
