'use strict';

var _ = require('underscore');
var configAdServing = require('./config');
var utils = require('../../../shared/utils');

function getConfigSlot(slotname) {
    return utils.get(configAdServing, ['slots', slotname], {});
}

function getConfigAD(type) {
    return utils.get(configAdServing, [type], {});
}

function getConfigTypes(config) {
    return utils.get(config, ['types'], {});
}

function getSettings(type) {
    var slotname = this.options.subId || this.options.subid;
    var configSlot = getConfigSlot(slotname);
    var configAD;
    var adType;
    var adParams;
    var settings = {
        enabled: false,
        slotname : slotname
    };

    if (configSlot.enabled) {
        adParams = _.extend({}, configSlot.types[type].params || {}, {
            container: slotname
        });
        configAD = getConfigAD(type);

        if (configAD.enabled) {
            configAD.params = _.extend({}, configAD.params, adParams);

            var countryCode = this.app.session.get('location').abbreviation;
            var searchQuery = getQuery(this.app);
            var repKey = '[countrycode]';

            if (searchQuery) {
                configAD.options = _.extend({}, configAD.options, {
                    pubId: configAD.options.pubId.replace(repKey, countryCode.toLowerCase()), //REVIEW
                    query: searchQuery, //TODO
                    channel: configAD.options.channel.replace(repKey, countryCode), //REVIEW
                    hl: this.app.session.get('selectedLanguage').split('-').shift()
                });
            }

            _.extend(settings, {
                enabled : true,
                type : adType,
                options : configAD.options,
                params : configAD.params
            });
        }
    }
    return settings;
}

function isEnabled() {
    var config = getConfigSlot(this.options.subId || this.options.subid);
    var enabled = config.enabled;
    var category;
    var adType;

    if (enabled) {
        category = getCategoryId(this.app);

        if (category) {
            adType = _.find(config.types || {}, function eachTypes(obj) {
                return _.contains(obj.categories, category);
            });
            enabled = !adType;
        }
    }
    return enabled;
}

function getCategoryId(app) {
    var postingLink = app.session.get('postingLink');

    if (postingLink) {
        return postingLink.subcategory || postingLink.category;
    }
}

function getSearchTerm(app) {
    return app.attributes.session.params.searchTerm;
}

function getCategory(app) {
    var postingLink = app.session.get('postingLink');
    var category;

    if (postingLink) {
        category = postingLink.subcategory || postingLink.category;
    }
    if (category) {
        // busco
    }
    return category;
}

function getCategories(app) {
    return ['Sales', 'Jobs'].join(',');
}

function getQuery(app) {
    return getSearchTerm(app) || getCategory(app) || getCategories(app);
}

module.exports = {
    getSettings: getSettings,
    isEnabled: isEnabled
};
