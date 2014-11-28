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

function getSettings(category) {
    var slotname = this.options.subId || this.options.subid;
    var configSlot = getConfigSlot(slotname);
    var configTypes;
    var configAD;
    var adType;
    var adParams;
    var settings = {
        enabled: false,
        slotname : slotname
    };

    if (configSlot.enabled) {
        configTypes = getConfigTypes(Object(configSlot));
        adParams = {
            'container': slotname
        };
        _.each(configTypes, function eachTypes(obj, type) {
            if(!adType && _.contains(obj.categories, category)){
                adType = type;
                if(obj.params){
                    _.extend(adParams, obj.params);
                }
            }
        });

        console.log(this.app.attributes.session.params.categoryId);
        console.log(configTypes.CSA.categories);

        configAD = getConfigAD(adType);

        if (configAD.enabled) {
            configAD.params = _.extend({}, configAD.params, adParams);

            var countryCode = this.app.session.get('location').abbreviation;
            var searchQuery = this.app.attributes.session.params.searchTerm;
            var repKey = '[countrycode]';

            if (searchQuery !== undefined) {
                configAD.options = _.extend({}, configAD.options, {
                    pubId: configAD.options.pubId.replace(repKey, countryCode.toLowerCase()), //REVIEW
                    query: searchQuery, //TODO
                    categoriesAsQuery: [185, 186, 16],
                    channel: configAD.options.channel.replace(repKey, countryCode), //REVIEW
                    hl: this.app.session.get('selectedLanguage').split('-').shift()
                });
            }

            console.log(configAD.options.categoriesAsQuery);

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

module.exports = {
    getSettings : getSettings
};
