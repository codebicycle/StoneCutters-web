'use strict';

var Base = require('../bases/model');

module.exports = Base.extend({
    idAttribute: 'id',
    url: '/items/:id/isFeaturable',
    isEnabled: isEnabled
});

module.exports.id = 'FeatureAd';

function isEnabled() {
    var enabled = false;

    if (this.has('enabled')) {
        enabled = this.get('enabled');
    }
    return enabled;
}
