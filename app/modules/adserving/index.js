'use strict';

var utils = require('../../../shared/utils');
var configAdServing = require('./config');

function getSlots(slotname) {
    return utils.get(configAdServing, ['slots', slotname], false);
}

module.exports = {
    csa: csa,
    adx: adx
};