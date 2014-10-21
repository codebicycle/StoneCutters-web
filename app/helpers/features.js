'use strict';

var _ = require('underscore');
var config = require('../../shared/config');

module.exports = (function() {

    function isEnabled(featureName, platform, location) {
        var status = false;
        var countryStatus;
        console.log(platform, location);
        var featureConfig = config.get(['features', platform || this.app.session.get('platform'), featureName], false);

        if (featureConfig) {
            countryStatus = _.contains(featureConfig.countries, location || this.app.session.get('location').url);
            status = (featureConfig.worldwide) ? !countryStatus : countryStatus;
        }
        return status;
    }

    return {
        isEnabled: isEnabled
    };
})();