'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var config = require('../../../../shared/config');
var utils = require('../../../../shared/utils');
var Base;

Backbone.noConflict();
Base = Backbone.Model;

function initialize(attrs, options) {
    this.app = options.app;
}

function isEnabled(categoryId) {
    var loactionUrl = this.app.session.get('location').url;
    var enabled = config.getForMarket(loactionUrl, ['userzoom', 'enabled'], false);
    var section;
    var platforms;
    var categories;

    if (enabled) {
        section = _.values(this.app.session.get('currentRoute')).join('#');
        platforms = config.getForMarket(loactionUrl, ['userzoom', 'sections', section, 'platforms'], []);
        enabled = config.getForMarket(loactionUrl, ['userzoom', 'sections', section], false) && _.contains(platforms, this.app.session.get('platform'));
    }

    if(categoryId) {
        categories = config.getForMarket(loactionUrl, ['userzoom', 'sections', section, 'categories'], []);
        enabled = _.contains(categories, categoryId);
    }

    return enabled;
}

function getParams(categoryId) {
    var params = {};
    var section = _.values(this.app.session.get('currentRoute')).join('#');
    var loactionUrl = this.app.session.get('location').url;

    if(categoryId) {
        params.file = config.getForMarket(loactionUrl, ['userzoom', 'sections', section, 'files'], [])[categoryId] || '';
    }
    else {
        params.file = config.getForMarket(loactionUrl, ['userzoom', 'sections', section, 'file'], '');
    }
    
    params.t = config.getForMarket(loactionUrl, ['userzoom', 'sections', section, 't'], '');
    params.delay = config.getForMarket(loactionUrl, ['userzoom', 'sections', section, 'delay'], 0);

    return params;
}

module.exports = Base.extend({
    initialize: initialize,
    isEnabled: isEnabled,
    getParams: getParams
});
