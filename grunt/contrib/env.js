'use strict';

module.exports = function(grunt) {
    var utils = require('../utils');
    var noLocalize = utils.option(grunt, ['nl', 'no-localize']);
    var envs = {
        oneweb: {}
    };

    if (noLocalize) {
        envs.oneweb.NO_LOCALIZE = true;
    }
    return envs;
};
