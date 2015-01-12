'use strict';

var _ = require('underscore');
var configTracking = require('../config');
var utils = require('../../../../shared/utils');
var tagmanager = utils.get(configTracking, ['tagmanager'], []);

function isEnabled() {
    return typeof tagmanager[this.app.session.get('location').url] !== 'underfined';
}

function getParams(params, options) {
    return tagmanager[this.app.session.get('location').url];
}

module.exports = {
    isEnabled: isEnabled,
    getParams: getParams
};
