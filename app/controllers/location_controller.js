'use strict';

var helpers = require('../helpers');

module.exports = {
    index: function(params, callback) {
        helpers.controllers.control(this, params, controller);

        function controller() {
            var spec;

            if (!params.search) {
                return callback(null, {
                    cities: this.app.getSession('location').topCities.models,
                    target: params.target
                });
            }
            spec = {
                cities: {
                    collection: 'Cities',
                    params: {
                        location: this.app.getSession('siteLocation'),
                        name: params.search
                    }
                }
            };
            this.app.fetch(spec, function afterFetch(err, result) {
                var cities = {
                    'models': result.cities.toJSON(),
                    '_byId': {},
                    'metadata': result.cities.get('metadata')
                };

                cities.models.forEach(function sortCity(city) {
                    cities._byId[city.url] = city;
                });
                callback(err, {
                    cities: cities.models,
                    search: params.search,
                    posting: params.posting
                });
            });
        }
    }
};
