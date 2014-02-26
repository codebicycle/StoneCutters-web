'use strict';

var EnvHelper = require('../helpers/env_helper');

module.exports = {
    index: function(params, callback) {
        EnvHelper.setUrlVars(this.app);
        var location = this.app.get('baseData').location;
        if (!params.search) {
            var cities = location.topCities;
            this.app.get('baseData').location.cities = cities;
            return callback(null, {
                'location': location,
                'cities': cities.models
            });
        }
        var siteLocation = this.app.get('baseData').siteLocation;
        var spec = {
            cities: {
                collection: 'Cities',
                params: {
                    location: siteLocation,
                    name: params.search
                }
            }
        }
        var that = this;
        this.app.fetch(spec, function(err, result) {
            var cities = {
                'models': result.cities.toJSON(),
                '_byId': {},
                'metadata': result.cities.get('metadata')
            }
            cities.models.forEach(function(city) {
                cities._byId[city.id] = city;
            });
            that.app.get('baseData').location.cities = cities;
            callback(err, {
                'location': location,
                'cities': cities.models,
                'search': params.search
            });
        });
    }
};
