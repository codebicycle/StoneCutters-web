'use strict';

var configAdServing = require('./config');
var utils = require('../../../shared/utils');

function getSlots (slotname) {
    return utils.get(configAdServing, ['slots', slotname], false);
}


function getSettings(slotname, category) {
	var config = getSlots(slotname);
	var categories;

	if (config.enabled) {
		categories = utils.get(Object(config), ['types', 'CSA', 'categories'], false);
	}

	return categories;
}

module.exports = {
	getSettings: getSettings
};