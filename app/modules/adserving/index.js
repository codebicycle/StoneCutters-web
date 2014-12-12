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
    this.set('type', getType.call(this));
}

function getSettings() {
    if (this.has('settings')) {
        return this.get('settings');
    }
    var slotname = this.get('slotname');
    var type = this.get('type');
    var configSlot = getConfigSlot(slotname);
    var settings = {
        enabled: false,
        slotname : slotname
    };
    var configAD;
    var query;

    if (configSlot.enabled) {
        configAD = utils.get(configAdServing, type, {});

        if (configAD.enabled) {
            configAD.params = _.extend({}, configAD.params, configSlot.types[type].params || {}, {
                container: slotname
            });
            configAD.options = _.extend({}, configAD.options, {
                query: getQuery.call(this),
                channel: createChannels.call(this, type),
                hl: this.app.session.get('selectedLanguage').split('-').shift()
            });

            _.extend(settings, {
                enabled: true,
                type: type,
                options: configAD.options,
                params: configAD.params,
                seo: configSlot.types[type].seo
            });
        }
    }
    this.set('settings', settings);
    return settings;
}

function createChannels(type) {
    var config = utils.get(configAdServing, type, {});
    var slotname = this.get('slotname');
    var configSlot = getConfigSlot(slotname);
    var countryCode = this.app.session.get('location').abbreviation;
    var repKey = '[countrycode]';
    var channelPrefix = config.options.channel.replace(repKey, countryCode);
    var currentRoute = this.app.session.get('currentRoute');
    var channels = [];
    var page = [];
    var channelPage;
    var channelConfig;
    var channelName;
    var channelLocation;
    var pageName;

    page.push(currentRoute.controller);
    page.push('#');
    page.push(currentRoute.action);
    pageName = page.join('');

    channelConfig = utils.get(configAdServing, ['channels', 'page', pageName], {});
    channelName = channelConfig.name;
    channelPage = getCategoryForChannel.call(this);
    channelLocation = configSlot.location;

    channels.push(channelPrefix);
    channels.push([channelPrefix, channelName].join('_'));
    channels.push([channelPrefix, channelPage].join('_'));
    channels.push([channelPrefix, channelName, channelPage].join('_'));
    channels.push([channelPrefix, channelName, channelLocation].join('_'));
    channels.push('[navigator]');
    channels.push([channelPrefix, channelName, channelLocation, 'Organic'].join('_'));

    return channels.join(' ');
}

function isSlotEnabled() {
    var enabled = this.isEnabled();
    var category;
    var config;
    var status;

    if (enabled) {
        config = getConfigSlot(this.get('slotname'));
        enabled = config.enabled;
        if (enabled) {
            category = getCategoryId.call(this);

            if (category) {
                status = _.find(config.types || {}, function eachTypes(obj) {
                    return _.contains(obj.excludedCategories, category);
                });
                enabled = !status;
            }
        }
    }
    return enabled;
}

function isEnabled() {
    var location = this.app.session.get('location');

    return config.getForMarket(location.url, ['adserving', 'enabled'], true);
}

function getType() {
    var slotname = this.get('slotname');
    var category = getCategoryId.call(this);
    var config = getConfigSlot(slotname);
    var type;

    if (category) {
        _.find(config.types || {}, function eachTypes(obj, key) {
            var is = !_.contains(obj.excludedCategories, category);

            if (is) {
                type = key;
            }
            return is;
        });
    }
    if (!type) {
        type = config.defaultType;
    }
    return type;
}

function getConfigSlot(slotname) {
    return utils.get(configAdServing, ['slots', slotname], {});
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

function getCategoriesQuery() {
    var configAD = utils.get(configAdServing, this.get('type'), {});

    return _.reduce(configAD.options.queryCategories, function(memo, id) {
        var category = getCategoryName.call(this, id);

        if (category) {
            memo.push(category);
        }
        return memo;
    }, [], this).join(' ').replace(/-/g, '');
}

function getQuery() {
    return getSearchQuery.call(this) || getCategoryQuery.call(this) || getCategoriesQuery.call(this);
}

function getCategoryId() {
    var dataPage = this.app.session.get('dataPage');

    if (dataPage) {
        return dataPage.subcategory || dataPage.category;
    }
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
            name = (subcategory || category).get(attr);
        }
    }
    return name;
}

function getCategoryName(id) {
    return getCategoryAttribute.call(this, id, 'trName');
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


module.exports = Base.extend({
    initialize: initialize,
    getSettings: getSettings,
    isEnabled: isEnabled,
    isSlotEnabled: isSlotEnabled
});

module.exports.id = 'Adserving';
