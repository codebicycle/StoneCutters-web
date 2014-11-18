'use strict';

var configAdServing = require('../config');
var utils = require('../../../../shared/utils');
var defaultConfig = utils.get(configAdServing, ['adx']);

function isEnabled() {
    var enabled = utils.get(defaultConfig, ['enabled'], false);

    return enabled;
}

module.exports = {
    isEnabled: isEnabled
};
