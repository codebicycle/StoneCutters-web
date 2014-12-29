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
            processOptions.call(this, params, options);
        }
    }
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
    var enabled = config.getForMarket(location.url, ['tracking', 'trackers', 'ati', 'enabled'], true);
    var pageName;
    var params;

    if (enabled) {
        enabled = isPlatformEnabled.call(this, config.getForMarket(location.url, ['tracking', 'trackers', 'ati', 'platforms']));
    }
    if (enabled && page) {
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

function standarizeName(name) {
    name = name.toLowerCase();
    name = name.replace(/'/g, '');
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
    if(params.category === 'error') {
        params.page_name = this.app.session.get('href');
    }
}

function prepareParams(params, options) {
    var actionType;

    if(!_.isUndefined(params.action_type)) {
        actionType = actionTypes[ params.action_type ];

        if (actionType) {
            actionType.call(this, params, options);
            return params;
        }
    }
    processOptions.call(this, params, options);
    return params;
}

function getParams(page, options) {
    var ati = utils.get(configTracking, ['ati', 'params', page], {});
    var custom = _.clone(ati.names);
    var config = getConfig.call(this);
    var params = {};

    prepareDefaultParams.call(this, custom);
    if (ati.process) {
        custom = prepareParams.call(this, custom, options);
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
    var location;
    var platform;
    var country;
    var config;

    options = options || {};
    location = options.location || this.app.session.get('location').url;
    platform = options.platform || this.app.session.get('platform');
    country = location;

    if (env !== 'production') {
        country = env;
    }
    if (platform !== 'desktop') {
        platform = 'default';
    }

    config = utils.get(configTracking, ['ati', 'paths', country, platform], defaultConfig[platform]);
    config = _.extend({}, config, {
        host: location.replace('www', ''),
        protocol: 'http',
        domain: this.app.session.get('domain')
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
        na: Math.round(Math.random() * 1000000),
        x20: this.app.session.get('platform')
    });
}

module.exports = {
    isEnabled: isEnabled,
    isServerEnabled: isServerEnabled,
    isClientEnabled: isClientEnabled,
    getParams: getParams,
    pageview: pageview,
    event: event
};
