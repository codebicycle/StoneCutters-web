'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var configAdServing = require('./config');
var logger = require('../../modules/logger');
var config = require('../../../shared/config');
var utils = require('../../../shared/utils');
var Categories = require('../../collections/categories');
var Base;

Backbone.noConflict();
Base = Backbone.Model;

function initialize(attrs, options) {
    options = options || {};
    this.app = options.app;
    this.categories = new Categories(options.categories);
    this.config = getConfig.call(this);
    this.set('service', this.config.service);
}

function getSettings() {
    if (this.has('settings')) {
        return this.get('settings');
    }
    var slotname = this.get('slotname');
    var service = this.get('service');
    var settings = {
        enabled: false,
        slotname : slotname
    };

    if (this.config.enabled) {
        settings.params = _.extend({}, this.config.params || {}, {
            number: getNumberPerCategory.call(this, service),
            container: slotname
        });
        settings.options = _.extend({}, this.config.options || {}, {
            query: getQuery.call(this),
            channel: createChannels.call(this, service),
            adPage: this.app.session.get('page') || 1,
            pubId: getClientId.call(this, service),
            hl: this.app.session.get('selectedLanguage').split('-').shift()
        });


        if (settings.params.adIconUrl && this.config.language) {
            settings.params.adIconUrl = settings.params.adIconUrl.replace(this.config.language.pattern, _.contains(this.config.language.list, settings.options.hl) ? settings.options.hl : this.config.language['default']);
        }

        _.extend(settings, {
            enabled: !!settings.params.number,
            service: service,
            seo: this.config.seo || 0
        });

        try {
            if (settings.options.pubId && ~settings.options.pubId.toLowerCase().indexOf('olx-za') && !settings.options.channel) {
                logger.log('[OLX_DEBUG] :: ZA Revenues :: url:', utils.fullizeUrl(this.app.session.get('url'), this.app));
            }
        } catch (e) {
            // Ignore
        }
    }
    this.set('settings', settings);
    return settings;
}

function extendConfig(defaults, extras) {
    var extended;

    extended = _.extend({}, defaults, extras);
    extended.params = _.extend({}, defaults.params || {}, extras.params || {});

    return extended;
}

function createChannels(service) {
    if (service === 'ADX') {
        return '';
    }
    var slotname = this.get('slotname');
    var configService = utils.get(configAdServing, [service, 'default'], {});
    var countryCode = this.app.session.get('location').abbreviation;
    var prefix = configService.options.channel.replace('[countrycode]', countryCode);
    var prefixMobile = prefix.replace('_', 'MW_');
    var currentRoute = this.app.session.get('currentRoute');
    var currentPlatform = this.app.session.get('platform');
    var currentRouteAction = currentRoute.action;
    var channels = [];
    var configChannel;
    var pageChannel;

    if (slotname === 'listing_noresult' && currentRoute.controller === 'searches' && currentRoute.action === 'search') {
        currentRouteAction = 'noresult';
    }

    if (currentPlatform !== 'desktop') {
        channels.push(prefix);
        channels.push(prefixMobile);
        return normalizeChannels(channels.join(','));
    }

    configChannel = utils.get(configAdServing, ['channels', 'page', [currentRoute.controller, currentRouteAction].join('#')], {});
    pageChannel = getCategoryForChannel.call(this);

    channels.push(prefix);
    channels.push([prefix, configChannel.name].join('_'));
    channels.push([prefix, pageChannel].join('_'));
    channels.push([prefix, configChannel.name, pageChannel].join('_'));
    channels.push([prefix, configChannel.name, this.config.location].join('_'));
    channels.push('[navigator]');
    channels.push([prefix, configChannel.name, this.config.location, 'Organic'].join('_'));

    return normalizeChannels(channels.join(','));
}

function normalizeChannels(channels) {
    return channels.replace(/&/g, '');
}

function getClientId(service) {
    var configType = utils.get(configAdServing, service, {});
    var pubId = utils.get(configType, ['default', 'options', 'pubId'], '');
    var countryCode = this.app.session.get('location').abbreviation.toLowerCase();
    var currentRoute = this.app.session.get('currentRoute');
    var clientId = [];

    if (service === 'ADX') {
        return pubId;
    }
    clientId.push(pubId);

    if (_.contains(configType.clientsIds, countryCode)) {
        clientId.push(countryCode);
    }

    if (service === 'CSA' && (currentRoute.controller !== 'searches' || !!~currentRoute.action.indexOf('allresults'))) {
        clientId.push('browse');
    }

    return clientId.join('-');
}

function getNumberPerCategory(service) {
    var number = this.config.params.number;
    var cat = getCategoryId.call(this);
    var action = this.app.session.get('currentRoute').action;

    if (service === 'ADX') {
        return typeof number === 'undefined' ? 1 : number;
    }
    if (!cat || action === 'statics') {
        cat = action;
    }

    return utils.get(this.config, ['numberPerCategoryCSA', cat], number);
}

function isServiceEnabled() {
    return this.isEnabled() && this.config.enabled;
}

function isEnabled() {
    return config.getForMarket(this.app.session.get('location').url, ['adserving', 'enabled'], false);
}

function getQuery() {
    var query = getSearchQuery.call(this);
    var category = getCategoryQuery.call(this);
    var querycategories = getCategoriesQuery.call(this);
    var queryResult = [];

    if (query) {
        queryResult.push(query);
    }

    if (category) {
        queryResult.push(category);
    }

    if (!queryResult.length && querycategories) {
        queryResult.push(querycategories);
    }

    return queryResult.join(' ');
}

function getSearchQuery() {
    var dataPage = this.app.session.get('dataPage');

    if (dataPage) {
        return dataPage.search;
    }
}

function getCategoryQuery() {
    var id = getCategoryId.call(this);

    if (id) {
        return getCategoryName.call(this, id);
    }
}

function getCategoryId() {
    var dataPage = this.app.session.get('dataPage');

    if (dataPage) {
        return dataPage.subcategory || dataPage.category;
    }
}

function getCategoryName(id) {
    return getCategoryAttribute.call(this, id, 'trName');
}

function getCategoryAttribute(id, attr) {
    var subcategory;
    var category;
    var name;

    if (id) {
        subcategory = this.categories.search(id);
        if (!subcategory) {
            category = this.categories.get(id);
        }
        if (subcategory || category) {
            name = (subcategory || category).get(attr).replace(/-/g, '');
        }
    }
    return name;
}

function getCategoriesQuery() {
    var section = _.values(this.app.session.get('currentRoute')).join('#');
    var categories = _.filter(this.config.queryCategories || [], function each(id) {
        return !!getCategoryName.call(this, id);
    }, this);

    if (categories.length && this.get('service') === 'CSA' && ~section.indexOf('searches#allresults')) {
        categories = [categories[(new Date()).getHours() % categories.length]];
    }
    return _.reduce(categories, function(memo, id) {
        var category = getCategoryName.call(this, id);

        if (category) {
            memo.push(category);
        }
        return memo;
    }, [], this).join(' ').replace(/-/g, '');
}

function getCategoryForChannel() {
    var id = getCategoryId.call(this);
    var name = 'NoCategory';

    if (id) {
        name = getCategoryAttribute.call(this, id, 'name');
        if (name) {
            name = name.replace(/\s/g, '');
        }
    }
    return name;
}

function getConfig() {
    var configMarket = config.getForMarket(this.app.session.get('location').url, ['adserving', 'slots'].concat(this.get('slotname').split('_')), {});
    var configService = utils.get(configAdServing, configMarket.service, {});
    var configFormatDefault = utils.get(configService, 'default', {});
    var configFormat = utils.get(configService, configMarket.format, {});
    var configFormats = extendConfig(configFormatDefault, configFormat);
    var configResult = extendConfig(configFormats, configMarket);

    return extendConfig(configResult, {
        enabled: configService.enabled,
        language: configService.language
    });
}

module.exports = Base.extend({
    initialize: initialize,
    getSettings: getSettings,
    isEnabled: isEnabled,
    isServiceEnabled: isServiceEnabled
});

module.exports.id = 'Adserving';
