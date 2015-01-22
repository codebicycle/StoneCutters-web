'use strict';

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
    var location = app.session.get('location');
    var pageSize = config.getForMarket(location.url, ['featured', 'section', getSection(app), 'quantity', 'total']);

    return {
        featuredAds: true,
        pageSize: pageSize || config.getForMarket(location.url, ['featured', 'quantity', 'total'], 2),
        offset: 0
    };
};

module.exports = FeatureAd;
module.exports.id = 'FeatureAd';
