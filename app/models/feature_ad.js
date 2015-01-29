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
