'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var configAdServing = require('./config');
var utils = require('../../../shared/utils');
var Categories = require('../../collections/categories');
var repKey = '[countrycode]';
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
    var countryCode = this.app.session.get('location').abbreviation;
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
                pubId: configAD.options.pubId.replace(repKey, countryCode.toLowerCase()), //REVIEW
                query: getQuery.call(this),
                channel: configAD.options.channel.replace(repKey, countryCode), //REVIEW
                hl: this.app.session.get('selectedLanguage').split('-').shift()
            });

            _.extend(settings, {
                enabled : true,
                type : type,
                options : configAD.options,
                params : configAD.params
            });
        }
    }
    this.set('settings', settings);
    return settings;
}

function isEnabled() {
    var config = getConfigSlot(this.get('slotname'));
    var enabled = config.enabled;
    var category;
    var type;

    if (enabled) {
        category = getCategoryId.call(this);

        if (category) {
            type = _.find(config.types || {}, function eachTypes(obj) {
                return _.contains(obj.excludedCategories, category);
            });
            enabled = !type;
        }
    }
    return enabled;
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

function getCategoryName(id) {
    var subcategory;
    var category;
    var name;

    if (id) {
        subcategory = this.categories.search(id);
        if (!subcategory) {
            category = this.categories.get(id);
        }
        if (subcategory || category) {
            name = (subcategory || category).get('trName');
        }
    }
    return name;
}

module.exports = Base.extend({
    initialize: initialize,
    getSettings: getSettings,
    isEnabled: isEnabled
});

module.exports.id = 'Adsense';
