'use strict';

var _ = require('underscore');
var Base = require('../bases/model');
var config = require('../../shared/config');

var FeatureAd = Base.extend({
    idAttribute: 'id',
    url: '/items/:id/isFeaturable',
    isEnabled: function() {
        var enabled = FeatureAd.isEnabled(this.app);

        if (enabled) {
            enabled = this.get('enabled') || false;
        }
        return enabled;
    }
});

function getSection(app) {
    var currentRoute = app.session.get('currentRoute');

    return [currentRoute.controller, currentRoute.action].join('#');
}

FeatureAd.isEnabled = function isEnabled(app) {
    var location = app.session.get('location');
    var enabled = FeatureAd.isLocationEnabled(location.url);

    if (enabled) {
        enabled = config.getForMarket(location.url, ['featured', 'section', getSection(app), 'enabled'], true);
    }
    return enabled;
};

FeatureAd.isLocationEnabled = function isLocationEnabled(location) {
    return config.getForMarket(location, ['featured', 'enabled'], false);
};

FeatureAd.getParams = function getParams(app) {
    var section = getSection(app);
    var location = app.session.get('location');
    var paramsDefault = config.getForMarket(location.url, ['featured', 'params'], {});
    var params = config.getForMarket(location.url, ['featured', 'section', section, 'params'], {});
    var pageSize = config.getForMarket(location.url, ['featured', 'section', section, 'quantity', 'total']);

    return _.defaults({
        pageSize: pageSize || config.getForMarket(location.url, ['featured', 'quantity', 'total'], 2)
    }, params, paramsDefault);
};

module.exports = FeatureAd;
module.exports.id = 'FeatureAd';
