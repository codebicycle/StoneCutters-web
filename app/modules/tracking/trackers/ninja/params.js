'use strict';

var _ = require('underscore');
var configTracking = require('../../config');
var logger = require('../../../logger');
var config = require('../../../../../shared/config');
var utils = require('../../../../../shared/utils');
var sorts = {
    price: 'price asc',
    pricedesc: 'price desc',
    datedesc: 'date desc'
};

function getCurrentPath(path) {
    if (path.charAt(0) === '/' && path.length > 1) {
        path = path.slice(1);
    }
    if (path.charAt(path.length - 1) === '/' && path.length > 1) {
        path = path.slice(0, path.length - 1);
    }
    if (path === '/' || path === '') {
        path = 'home';
    }
    return path;
}

function setDefaults(params, options, page) {
    var user = this.app.session.get('user');
    var location = this.app.session.get('location');
    var platform = this.app.session.get('platform');
    var platforms = config.getForMarket(location.url, ['tracking', 'trackers', 'ninja', 'noscript', 'platforms'], []);

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
    if (platform !== 'desktop') {
        platform = 'mobile-' + platform;
    }
    params.platformType = platform;
    if (options.category) {
        params.categoryLevel1Id = options.category.id;
        params.categoryLevel1Name = options.category.name;
    }
    if (options.subcategory) {
        params.categoryLevel2Id = options.subcategory.id;
        params.categoryLevel2Name = options.subcategory.name;
    }
    if (_.contains(platforms, this.app.session.get('platform'))) {
        params.clientId = this.app.session.get('clientId');
    }
    if (!params.trackPage) {
        logger.log('[OLX_DEBUG]', 'Tracking | Ninja not contains trackPage in', page, '|', platform);
        params.trackPage = getCurrentPath(this.app.session.get('path'));
    }
}

function setCustoms(params, options) {
    if (options.item) {
        params.itemId = options.item.id;
        if (options.item.user) {
            params.sellerId = options.item.user.id;
        }
        if (options.item.images) {
            params.imagesCount = options.item.images.length;
        }
        if (options.item.date && options.item.date.timestamp) {
            params.creationDate = options.item.date.timestamp;
        }
    }
    if (options.paginator) {
        params.pageNumber = options.paginator.get('page');
        params.pageCount = options.paginator.get('totalPages');
        params.resultCount = options.paginator.get('total');
    }
    if (options.filters) {
        if (options.filters && options.filters.has('sort')) {
            params.sortBy = sorts[options.filters.get('sort').get('current')[0]];
        }
    }
    if (options.keyword) {
        params.searchString = options.keyword;
    }
}

function setExtras(params, options) {

}

function get(page, options) {
    var params = utils.get(configTracking, ['ninja', 'params', page], {});

    setDefaults.call(this, params, options, page);
    setCustoms.call(this, params, options);
    setExtras.call(this, params, options);
    return params;
}

module.exports = {
    get: get
};
