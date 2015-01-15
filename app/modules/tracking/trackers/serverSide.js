'use strict';

var _ = require('underscore');
var config = require('../../../../shared/config');
var utils = require('../../../../shared/utils');
var analytics = require('./analytics');
var ati = require('./ati');
var esi = require('../../esi');

function isEnabled(page) {
    var location = this.app.session.get('location');
    var enabled = config.getForMarket(location.url, ['tracking', 'trackers', 'serverSide', 'enabled'], true);
    var platforms;

    if (enabled) {
        platforms = config.getForMarket(location.url, ['tracking', 'trackers', 'serverSide', 'platforms']);
        if (platforms && !_.contains(platforms, this.app.session.get('platform'))) {
            enabled = false;
        }
    }
    return enabled;
}

function getParams(page, options) {
    var location = this.app.session.get('location');
    var sid = this.app.session.get('sid');
    var analyticsEnabled = analytics.isServerEnabled.call(this, page);
    var atiEnabled = ati.isServerEnabled.call(this, page);
    var params = {};
    var analyticsParams;
    var atiParams;

    if (sid) {
        params.sid = esi.esify.call(this, '$(sid)', sid);
    }
    params.r = esi.esify.call(this, '$rand()', Math.round(Math.random() * 1000000));
    params.referer = esi.esify.call(this, '$url_encode($(HTTP_REFERER|\'-\'))', (this.app.session.get('referer') || '-'));
    params.locNm = location.name;
    params.locId = location.id;
    params.locUrl = location.url;

    if (analyticsEnabled) {
        analyticsParams = options.analyticsParams || analytics.getParams.call(this, page, options.query);
        params.page = analyticsParams.page;
    }
    if (atiEnabled) {
        atiParams = options.atiParams || ati.getParams.call(this, page, options.query);
        params.custom = atiParams.custom;
    }
    return params;
}

function pageview(params, options) {
    return utils.params('/tracking/pageview.gif?', params);
}

module.exports = {
    isEnabled: isEnabled,
    getParams: getParams,
    pageview: pageview
};
