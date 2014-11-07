'use strict';

var _ = require('underscore');
var configTracking = require('../config');
var config = require('../../../../shared/config');
var utils = require('../../../../shared/utils');
var esi = require('../../esi');
var env = config.get(['environment', 'type'], 'production');
var defaultConfig = utils.get(configTracking, ['ati', 'paths', 'default']);

var actionTypes = {
    edited: function (params, options) {
        if (options.itemEdited) {
            processOptions(params, options);
        }
    }
};

function standarizeName(name) {
    name = name.toLowerCase();
    name = name.replace(/-/g, '');
    name = name.replace(/\s\s/g, ' ');
    name = name.replace(/\s/g, '_');
    name = name.replace(/\//g, '_');
    return name;
}

function prepareDefaultParams(params) {
    var user = this.app.session.get('user');
    var platform = this.app.session.get('platform');
    var location;

    if (!params) {
        params = {};
    }
    if (user) {
        params.user_id = esi.esify.call(this, '$(user_id)', user.id);
    }
    location = this.app.session.get('location');
    if (location && location.current) {
        params.geo2 = standarizeName(location.current.name || '');
    }
    if (platform !== 'desktop') {
        params.platform = platform;
    }
    params.language = this.app.session.get('selectedLanguage');
}

function processOptions(params, options) {
    var location;

    if(!_.isUndefined(params.keyword)) {
        params.keyword = options.keyword;
    }
    if(!_.isUndefined(params.page_nb)) {
        params.page_nb = options.page_nb;
    }
    if(!_.isUndefined(params.ad_id) && options.item) {
        params.ad_id = options.item.id;
        if(options.item.images) {
            params.ad_photo = options.item.images.length;
        }
        if(options.category) {
            params.category = standarizeName(options.category.name);
            params.ad_category = standarizeName(options.category.name);
        }
        if(options.subcategory) {
            params.subcategory = standarizeName(options.subcategory.name);
            params.ad_subcategory = standarizeName(options.subcategory.name);
        }
        if(!_.isUndefined(params.geo1)) {
            location = options.item.location;
            if (location.children && location.children[0]) {
                params.geo1 = standarizeName(location.children[0].name || '');
            }
        }
        if(!_.isUndefined(params.geo2)) {
            location = options.item.location;
            if (location.children && location.children[0] && location.children[0].children && location.children[0].children[0]) {
                params.geo2 = standarizeName(location.children[0].children[0].name || '');
            }
        }
        if(!_.isUndefined(params.posting_to_action) && options.item.date) {
            params.posting_to_action = utils.daysDiff(new Date(options.item.date.timestamp));
        }
        if(!_.isUndefined(params.poster_id) && options.item.user) {
            params.poster_id = options.item.user.id;
            params.poster_type = 'registered_logged';
        }
    }
    if(!_.isUndefined(params.funnel_category) && options.category) {
        params.funnel_category = options.category.name;
    }
    if(!_.isUndefined(params.funnel_subcategory) && options.subcategory) {
        params.funnel_subcategory = options.subcategory.name;
    }
    if(!_.isUndefined(params.subcategory) && options.subcategory) {
        params.subcategory = standarizeName(options.subcategory.name);
    }
    if(params.page_name === 'expired_category' && options.category) {
        if (options.subcategory) {
            params.page_name = 'listing_' + standarizeName(options.subcategory.name);
            params.category = standarizeName(options.category.name);
        }
        else if (options.category) {
            params.page_name = 'listing_' + standarizeName(options.category.name);
            params.category = standarizeName(options.category.name);
        }
        else {
            params.page_name = 'listing_all';
        }
    }
    if((params.page_name === 'posting_step4' || params.page_name === 'edit_ad_form') && options.category) {
        params.ad_category = options.category.name;
        if (options.subcategory) {
            params.ad_subcategory = options.subcategory.name;
        }
    }
    if(params.subcategory === 'expired_subCategory') {
        delete params.subcategory;
    }
}

function prepareParams(params, options) {
    var actionType;

    if(!_.isUndefined(params.action_type)) {
        actionType = actionTypes[ params.action_type ];

        if (actionType) {
            actionType(params, options);
            return params;
        }
    }
    processOptions(params, options);
    return params;
}

function getParams(page, options) {
    var ati = utils.get(configTracking, ['ati', 'params', page], {});
    var custom = _.clone(ati.names);
    var config = getConfig.call(this);
    var params = {};

    prepareDefaultParams.call(this, custom);
    if (ati.process) {
        custom = prepareParams(custom, options);
    }
    params.custom = JSON.stringify(custom);
    if (!params.custom) {
        try {
            console.log('[OLX_DEBUG]', 'ati-custom', page, JSON.stringify(params));
        } catch(e) {}
    }
    return _.extend(params, config);
}

function getConfig(options) {
    var siteLocation;
    var platform;
    var country;
    var config;

    options = options || {};
    siteLocation = options.siteLocation || this.app.session.get('siteLocation');
    platform = options.platform || this.app.session.get('platform');
    country = siteLocation;

    if (env !== 'production') {
        country = env;
    }
    if (platform !== 'desktop') {
        platform = 'default';
    }

    config = utils.get(configTracking, ['ati', 'paths', country, platform], defaultConfig[platform]);
    config = _.extend({}, config, {
        host: siteLocation.replace('www', ''),
        protocol: 'http'
    });

    if (options.siteId) {
        config.siteId = options.siteId;
    }
    if (options.logServer) {
        config.logServer = options.logServer;
    }
    return config;
}

function pageview(params, options) {
    var config = getConfig.call(this, options);

    return utils.params(['http://', config.logServer, '.ati-host.net/hit.xiti'].join(''), {
        s: config.siteId,
        stc: params.custom,
        idclient: params.clientId,
        ref: params.referer,
        na: Math.round(Math.random() * 1000000)
    });
}

function event(params, options) {
    var config = getConfig.call(this, options);

    return utils.params(['http://', config.logServer, '.ati-host.net/go.click'].join(''), {
        xts: config.siteId,
        p: params.custom,
        clic: 'A',
        type: 'click',
        idclient: params.clientId,
        url: params.url,
        na: Math.round(Math.random() * 1000000)
    });
}

function isEnabled(page) {
    var location = this.app.session.get('location');
    var enabled = config.getForMarket(location.url, ['tracking', 'trackers', 'ati', 'enabled'], true);

    if (!enabled) {
        return false;
    }
    return !!utils.get(configTracking, ['ati', 'params', page]);
}

function isEnabledServer(page) {
    var location = this.app.session.get('location');
    var enabled = isEnabled.call(this, page);

    if (!enabled) {
        return false;
    }
    return config.getForMarket(location.url, ['tracking', 'trackers', 'ati', 'server'], true);
}

function isEnabledClient(page) {
    var location = this.app.session.get('location');
    var enabled = isEnabled.call(this, page);

    if (!enabled) {
        return false;
    }
    return config.getForMarket(location.url, ['tracking', 'trackers', 'ati', 'client'], true);
}

module.exports = {
    isEnabled: isEnabled,
    isEnabledServer: isEnabledServer,
    isEnabledClient: isEnabledClient,
    getParams: getParams,
    pageview: pageview,
    event: event
};