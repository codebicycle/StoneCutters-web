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

FeatureAd.isEnabled = function isEnabled(app) {
    return config.getForMarket(location.url, ['featured', 'enabled'], false);
};

module.exports = FeatureAd;
module.exports.id = 'FeatureAd';
