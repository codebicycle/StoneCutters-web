'use strict';

var helpers = require('../helpers');

module.exports = {
    index: function(params, callback) {
        var app = helpers.environment.init(this.app);
        var location = app.getSession('location');
        var cities = location.topCities;

        if (!params.search) {
            location.cities = cities;
            return callback(null, {
                'location': location,
                'cities': cities.models
            });
        }

        (function fetchCities() {
            var spec = {
                cities: {
                    collection: 'Cities',
                    params: {
                        location: app.getSession('siteLocation'),
                        name: params.search
                    }
                }
            };

            app.fetch(spec, function afterFetch(err, result) {
                var cities = {
                    'models': result.cities.toJSON(),
                    '_byId': {},
                    'metadata': result.cities.get('metadata')
                };

                cities.models.forEach(function sortCity(city) {
                    cities._byId[city.id] = city;
                });
                location.cities = cities;
                callback(err, {
                    'location': location,
                    'cities': cities.models,
                    'search': params.search
                });
            });
        })();
    }
};
