'use strict';

var _ = require('underscore');
var Base = require('../bases/model');
var config = require('../../shared/config');

var FeatureAd = Base.extend({
    idAttribute: 'id',
    url: '/items/:id/isFeaturable',
    parse: function(response) {
        if (response && response.sections) {
            response.sections = _.uniq(response.sections, function predicate(section) {
               return section.sectionId + section.conceptId;
            });
        }
        return response;
    },
    isEnabled: function() {
        return FeatureAd.isEnabled(this.app);
    },
    getSection: function(id) {
        var section = _.find(this.get('sections'), function each(section) {
            return section.sectionId === id;
        });
        return section;
   }
});

function isPlatformEnabled(app, platforms) {
    var enabled = true;

    if (platforms && !_.contains(platforms, app.session.get('platform'))) {
        enabled = false;
    }
    return enabled;
}

FeatureAd.isEnabled = function isEnabled(app, section) {
    var location = app.session.get('location');
    var env = config.get(['environment', 'type'], 'development');
    var enabled = FeatureAd.isLocationEnabled(location.url);
    var environments;

    section = section || _.values(app.session.get('currentRoute')).join('#');

    if (enabled) {
        enabled = isPlatformEnabled(app, config.getForMarket(location.url, ['featured', 'platforms']));
    }
    if (enabled) {
        environments = config.getForMarket(location.url, ['featured', 'environments']);
        if (environments) {
            enabled = _.contains(environments, env);
        }
    }
    if (enabled && !config.getForMarket(location.url, ['featured', 'sections', 'all'], false)) {
        enabled = config.getForMarket(location.url, ['featured', 'sections', section, 'enabled'], false);
    }
    if (enabled) {
        environments = config.getForMarket(location.url, ['featured', 'sections', section, 'environments']);
        if (environments) {
            enabled = _.contains(environments, env);
        }
    }
    return enabled;
};

FeatureAd.isLocationEnabled = function isLocationEnabled(location) {
    return config.getForMarket(location, ['featured', 'enabled'], false);
};

module.exports = FeatureAd;
module.exports.id = 'FeatureAd';
