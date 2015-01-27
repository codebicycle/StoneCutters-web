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
    var enabled = config.getForMarket(location.url, ['tracking', 'trackers', 'ninja', 'enabled'], true);

    if (enabled) {
        enabled = isPlatformEnabled.call(this, config.getForMarket(location.url, ['tracking', 'trackers', 'ninja', 'platforms']));
    }
    return enabled;
}

function setDefaultParams(params, options) {
    var location = this.app.session.get('location');
    var user = this.app.session.get('user');

    params.language = this.app.session.get('selectedLanguage');
    if (location.children && location.children.length) {
        location = location.children[0];
        params.provinceId = location.id;
        params.provinceName = location.name;
        if (location.children && location.children.length) {
            location = location.children[0];
            params.cityId = location.id;
            params.cityName = location.name;
        }
    }
    if (user) {
        params.userId = user.userId;
    }
    params.platformType = this.app.session.get('platform');
    if (params.platformType !== 'desktop') {
        params.platformType = 'mobile-' + params.platformType;
    }
    if (options.category) {
        params.categoryLevel1Id = options.category.id;
        params.categoryLevel1Name = options.category.name;
    }
    if (options.subcategory) {
        params.categoryLevel2Id = options.subcategory.id;
        params.categoryLevel2Name = options.subcategory.name;
    }
}

function setCustomParams(params,options) {
    var item = this.app.session.get('item');

    params.pageNumber = options.page;  

    if (item) {
        params.itemId = item.id;
        params.sellerId = item.user.id;
        params.sellerType = 'private';
        params.imagesCount = item.images.length;
        params.creationDate = item.date.timestamp;   
    }

}

function getParams(page, options) {
    var params = utils.get(configTracking, ['ninja', 'params', page], {});

    setDefaultParams.call(this, params, options);
    setCustomParams.call(this, params, options);

    return params;
}

module.exports = {
    isEnabled: isEnabled,
    getParams: getParams
};
