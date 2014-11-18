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

function getSettings(slotname, category) {
    var configSlot = getConfigSlot(slotname);
    var settings = {
        enabled: false,
        slotname : slotname
    };

    if(configSlot.enabled) {
        var configTypes = utils.get(Object(configSlot), ['types'], {});
        var adType;
        var adParams = {
            'container': slotname
        };

        _.each(configTypes, function eachTypes(obj, type) {
            if(_.contains(obj.categories, category)){
                adType = type;
                if(obj.params){
                    _.extend(adParams, obj.params);
                }
            }
        });

        var configAD = getConfigAD(adType);

        if(configAD.enabled) {
            _.extend(configAD.params, adParams);

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
