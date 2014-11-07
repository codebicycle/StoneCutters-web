'use strict';

var _ = require('underscore');
var configTracking = require('../config');
var config = require('../../../../shared/config');
var utils = require('../../../../shared/utils');
var common = require('./common');

var customParams = {
    cat: function(params, options) {
        if(options.category) {
            params.cat = options.category.id;
        }
    },
    iid: function(params, options) {
        if(options.item) {
            params.iid = options.item.id;
        }
    }
};

function isEnabled(page) {
    var location = this.app.session.get('location');
    var enabled = config.getForMarket(location.url, ['tracking', 'trackers', 'hydra'], true);
    var pageName;
    var params;

    if (!enabled) {
        return false;
    }
    pageName = utils.get(configTracking, ['common', 'pages', page]);
    params = utils.get(configTracking, ['hydra', 'params', location.url]);
    return !!params && !!pageName;
}

function getParams(page, options) {
    var location = this.app.session.get('location');
    var language = this.app.session.get('selectedLanguage');
    var params = utils.get(configTracking, ['hydra', 'params', location.url], {});
    var pageName = common.getPageName.call(this, page, options);

    params = _.extend({}, params, {
        lang: language.split('-').shift(),
        cou: location.abbreviation
    });
    _.each(customParams, function(param) {
        param.call(this, params, options);
    }, this);

    return {
        page: pageName,
        params: JSON.stringify(params)
    };
}

module.exports = {
    isEnabled: isEnabled,
    getParams: getParams
};