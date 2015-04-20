'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var config = require('../../../../shared/config');
var configUserzoom = require('../config');
var utils = require('../../../../shared/utils');
var Base;

Backbone.noConflict();
Base = Backbone.Model;

function initialize(attrs, options) {
    this.app = options.app;
}

function isEnabled() {
    var loactionUrl = this.app.session.get('location').url;
    var enabled = config.getForMarket(loactionUrl, ['userzoom', 'enabled'], false);
    var section;
    var platforms;

    if (enabled) {
        section = _.values(this.app.session.get('currentRoute')).join('#');
        platforms = config.getForMarket(loactionUrl, ['userzoom', section, 'platforms'], []);
        enabled = config.getForMarket(loactionUrl, ['userzoom', section, 'enabled'], false) && _.contains(platforms, this.app.session.get('platform'));
    }

    return enabled;
}

function getParams() {
    var params = {};
    var section = _.values(this.app.session.get('currentRoute')).join('#');
    var loactionUrl = this.app.session.get('location').url;

    params.file = utils.get(configUserzoom, [loactionUrl, section, 'file']);
    params.t = utils.get(configUserzoom, [loactionUrl, section, 't']);

    return params;
}

module.exports = Base.extend({
    initialize: initialize,
    isEnabled: isEnabled,
    getParams: getParams
});
