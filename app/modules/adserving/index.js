'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var configAdServing = require('./config');
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
    this.set({
        'service': this.config.service,
        'format': this.config.format,
        'classname': 'adserving-' + this.config.service.toLowerCase() + ' ' + this.get('slotname')
    });
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
            container: slotname
        });
        settings.options = _.extend({}, this.config.options || {}, {
            query: getQuery.call(this),
            channel: createChannels.call(this, service),
            hl: this.app.session.get('selectedLanguage').split('-').shift()
        });

        if (settings.params.adIconUrl && this.config.language) {
            settings.params.adIconUrl = settings.params.adIconUrl.replace(this.config.language.pattern, _.contains(this.config.language.list, settings.options.hl) ? settings.options.hl : this.config.language['default']);
        }

        _.extend(settings, {
            enabled: true,
            service: service,
            seo: this.config.seo || 0
        });
    }

    this.set('settings', settings);
    return settings;
}

function extendConfig(config, defaults) {
    config = _.extend({}, defaults, config);
    config.params = _.extend({}, defaults.params || {}, config.params || {});
    return config;
}

function createChannels(service) {
    if (service === 'ADX') {
        return;
    }
    var slotname = this.get('slotname');
    var configService = utils.get(configAdServing, [service, 'default'], {});
    var countryCode = this.app.session.get('location').abbreviation;
    var prefix = configService.options.channel.replace('[countrycode]', countryCode);
    var currentRoute = this.app.session.get('currentRoute');
    var currentRouteAction = currentRoute.action;
    var channels = [];
    var configChannel;
    var pageChannel;

    if (slotname === 'listing_noresult' && currentRoute.controller === 'searches' && currentRoute.action === 'search') {
        currentRouteAction = 'noresult';
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

    return channels.join(service === 'CSA' ? ' ' : ',');
}

function isServiceEnabled() {
    return this.isEnabled() && this.config.enabled;
}

function isEnabled() {
    return config.getForMarket(this.app.session.get('location').url, ['adserving', 'enabled'], false);
}

function getQuery() {
    return getSearchQuery.call(this) || getCategoryQuery.call(this) || getCategoriesQuery.call(this);
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
    return _.reduce(this.config.queryCategories || [], function(memo, id) {
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
    var configFormats = extendConfig(configFormat, configFormatDefault);
    var configResult = extendConfig(configMarket, configFormats);

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
