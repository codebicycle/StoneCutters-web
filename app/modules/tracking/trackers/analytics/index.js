'use strict';

var _ = require('underscore');
var crypto = require('crypto');
var configTracking = require('../../config');
var config = require('../../../../../shared/config');
var utils = require('../../../../../shared/utils');
var paramsManager = require('./params');
var common = require('../common');
var eventsKeys = {
    ec: 'category',
    ea: 'action',
    el: 'label',
    ev: 'value'
};

function isPlatformEnabled(platforms) {
    var enabled = true;

    if (platforms && !_.contains(platforms, this.app.session.get('platform'))) {
        enabled = false;
    }
    return enabled;
}

function isEnabled(page) {
    var location = this.app.session.get('location');
    var enabled = config.getForMarket(location.url, ['tracking', 'trackers', 'analytics', 'enabled'], true);
    var pageName;
    var params;

    if (enabled) {
        enabled = isPlatformEnabled.call(this, config.getForMarket(location.url, ['tracking', 'trackers', 'analytics', 'platforms']));
    }
    if (enabled) {
        enabled = !!utils.get(configTracking, ['common', 'pages', page]);
    }
    return enabled;
}

function isTypeEnabled(page, type) {
    var location = this.app.session.get('location');
    var enabled = isEnabled.call(this, page);

    if (enabled) {
        enabled = config.getForMarket(location.url, ['tracking', 'trackers', 'analytics', type, 'enabled'], true);
    }
    if (enabled) {
        enabled = isPlatformEnabled.call(this, config.getForMarket(location.url, ['tracking', 'trackers', 'analytics', type, 'platforms']));
    }
    return enabled;
}

function isServerEnabled(page) {
    return isTypeEnabled.call(this, page, 'server');
}

function isClientEnabled(page) {
    return isTypeEnabled.call(this, page, 'client');
}

function getParams(page, options) {
    var platform = this.app.session.get('platform');
    var siteLocation = this.app.session.get('siteLocation');
    var params = {};

    params.page = common.getPageName.call(this, page, options);
    params.host = this.app.session.get('host');
    params.id = paramsManager.getId(siteLocation, platform);
    params.osName = this.app.session.get('osName');
    params.osVersion = this.app.session.get('osVersion');
    params.location = this.app.session.get('location').name;

    if (options.keyword) {
        params.keyword = options.keyword;
    }
    if (paramsManager.check.call(this)) {
        paramsManager.update.call(this);
    }
    return params;
}

function pageview(params, options) {
    var utmvid = '0x' + crypto.createHash('md5').update(params.clientId).digest('hex').substr(0, 16);
    var query = {
        utmwv: '5.5.4',
        utms: params.hitCount,
        utmhn: params.host,
        utmn: Math.round(Math.random() * 1000000),
        utmr: params.referer,
        utmp: params.page,
        utmac: paramsManager.getId.call(this, options.siteLocation, options.platform),
        utmcc: paramsManager.getUtmcc.call(this),
        utmvid: utmvid,
        utmip: params.ip
    };

    if (params.keyword) {
        query.utmdt = params.keyword;
    }
    if (params.custom) {
        query.utme = params.custom;
    }
    if (params.language) {
        query.utmul = params.language;
    }
    return utils.params('http://www.google-analytics.com/__utm.gif', query);
}

function event(params, options) {
    var query = {
        v: '1',
        tid: paramsManager.getId.call(this, options.siteLocation, options.platform),
        cid: params.clientId,
        t: 'event',
        dh: params.host,
        dp: params.page,
        dr: params.referer
    };

    if (params.ip) {
        query.uip = params.ip;
    }
    if (params.hitCount) {
        query._s = params.hitCount;
    }
    if (params.language) {
        query.ul = params.language;
    }

    _.each(eventsKeys, function(value, key) {
        if (params[value]) {
            query[key] = params[value];
        }
    });
    query.z = Math.round(Math.random() * 1000000);
    return utils.params('http://www.google-analytics.com/collect', query);
}

function isPlatformEnabled(platforms) {
    var platform = this.app.session.get('platform');
    var enabled = true;

    if (platforms && !_.contains(platforms, platform)) {
        enabled = false;
    }
    return enabled;
}

function isEnabled(page) {
    var location = this.app.session.get('location');
    var enabled = config.getForMarket(location.url, ['tracking', 'trackers', 'ati', 'enabled'], true);
    var pageName;
    var params;

    if (enabled) {
        enabled = isPlatformEnabled.call(this, config.getForMarket(location.url, ['tracking', 'trackers', 'ati', 'platforms']));
    }
    if (enabled) {
        enabled = !!utils.get(configTracking, ['ati', 'params', page]);
    }
    return enabled;
}

function isTypeEnabled(page, type) {
    var location = this.app.session.get('location');
    var enabled = isEnabled.call(this, page);

    if (enabled) {
        enabled = config.getForMarket(location.url, ['tracking', 'trackers', 'ati', type, 'enabled'], true);
    }
    if (enabled) {
        enabled = isPlatformEnabled.call(this, config.getForMarket(location.url, ['tracking', 'trackers', 'ati', type, 'platforms']));
    }
    return enabled;
}

function isServerEnabled(page) {
    return isTypeEnabled.call(this, page, 'server');
}

function isClientEnabled(page) {
    return isTypeEnabled.call(this, page, 'client');
}

module.exports = {
    isEnabled: isEnabled,
    isServerEnabled: isServerEnabled,
    isClientEnabled: isClientEnabled,
    getParams: getParams,
    pageview: pageview,
    event: event
};
