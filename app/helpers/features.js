'use strict';

var _ = require('underscore');
var config = require('../../shared/config');

module.exports = (function() {

    function isEnabled(featureName) {
        var status = false;
        var featureConfig = config.get(['features', this.app.session.get('platform'), featureName], false);

        if (featureConfig) {
            var countryStatus = _.contains(featureConfig.countries, this.app.session.get('location').url);
            status = (featureConfig.worldwide) ? !countryStatus : countryStatus;
        }

        return status;
    }

    return {
        isEnabled: isEnabled
    };
})();