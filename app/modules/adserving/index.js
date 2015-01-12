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
    this.config = utils.get(configAdServing, ['slots', attrs.slotname], {});
    this.set('type', this.config.type);
}

function getSettings() {
    if (this.has('settings')) {
        return this.get('settings');
    }
    var slotname = this.get('slotname');
    var type = this.get('type');
    var settings = {
        enabled: false,
        slotname : slotname
    };
    var configType;
    var query;

    if (this.config.enabled) {
        configType = utils.get(configAdServing, type, {});

        if (configType.enabled) {
            settings.params = _.extend({}, configType.params, this.config.params || {}, {
                container: slotname
            });
            settings.options = _.extend({}, configType.options, {
                query: getQuery.call(this),
                channel: createChannels.call(this, type),
                hl: this.app.session.get('selectedLanguage').split('-').shift()
            });

            // TODO Mover a CSA module (create)
            if (settings.params.adIconUrl) {
                settings.params.adIconUrl = settings.params.adIconUrl.replace(configType.language.pattern, _.contains(configType.language.list, settings.options.hl) ? settings.options.hl : configType.language['default']);
            }

            _.extend(settings, {
                enabled: true,
                type: type,
                seo: this.config.seo
            });
        }
    }
    this.set('settings', settings);
    return settings;
}

function createChannels(type) {
    if (type === 'ADX') {
        return;
    }
    var slotname = this.get('slotname');
    var configType = utils.get(configAdServing, type, {});
    var countryCode = this.app.session.get('location').abbreviation;
    var prefix = configType.options.channel.replace('[countrycode]', countryCode);
    var currentRoute = this.app.session.get('currentRoute');
    var channels = [];
    var configChannel;
    var pageChannel;

    configChannel = utils.get(configAdServing, ['channels', 'page', [currentRoute.controller, currentRoute.action].join('#')], {});
    pageChannel = getCategoryForChannel.call(this);

    channels.push(prefix);
    channels.push([prefix, configChannel.name].join('_'));
    channels.push([prefix, pageChannel].join('_'));
    channels.push([prefix, configChannel.name, pageChannel].join('_'));
    channels.push([prefix, configChannel.name, this.config.location].join('_'));
    channels.push('[navigator]');
    channels.push([prefix, configChannel.name, this.config.location, 'Organic'].join('_'));

    return channels.join(type === 'CSA' ? ' ' : ',');
}

function isSlotEnabled() {
    var enabled = this.isEnabled();
    var category;
    var status;

    if (enabled) {
        enabled = this.config.enabled;
        if (enabled) {
            category = getCategoryId.call(this);

            if (category) {
                enabled = !_.contains(this.config.excludedCategories, category);
            }
        }
    }
    return enabled;
}

function isEnabled() {
    var location = this.app.session.get('location');

    return config.getForMarket(location.url, ['adserving', 'enabled'], true);
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

    return _.reduce(configAD.options.queryCategories || [], function(memo, id) {
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
