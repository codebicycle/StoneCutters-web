'use strict';

var configAdServing = require('./config/slots');
var utils = require('../../../shared/utils');

function getSlots (slotname) {
    return utils.get(configAdServing, ['slots', slotname], false);
}

function isEnabled (config) {
	return utils.get(config, ['enabled'], false);
}

function getSettings(slotname, categories) {
	var config = getSlots(slotname);
	//var enabled = isEnabled(config);
}

module.exports = {
	getSettings: getSettings
};