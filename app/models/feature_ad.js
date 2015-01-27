'use strict';

var _ = require('underscore');
var Base = require('../bases/model');
var config = require('../../shared/config');

var FeatureAd = Base.extend({
    idAttribute: 'id',
    url: '/items/:id/isFeaturable',
    isEnabled: function() {
        return FeatureAd.isEnabled(this.app);
    }
});

FeatureAd.isEnabled = function isEnabled(app) {
    var currentRoute = app.session.get('currentRoute');
    var section = [currentRoute.controller, currentRoute.action].join('#');
    var location = app.session.get('location');
    var enabled = FeatureAd.isLocationEnabled(location.url);

    if (enabled) {
        enabled = config.getForMarket(location.url, ['featured', 'section', section, 'enabled'], true);
    }
    return enabled;
};

FeatureAd.isLocationEnabled = function isLocationEnabled(location) {
    return config.getForMarket(location, ['featured', 'enabled'], false);
};

module.exports = FeatureAd;
module.exports.id = 'FeatureAd';
