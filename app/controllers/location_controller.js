'use strict';

var helpers = require('../helpers');

module.exports = {
    index: function(params, callback) {
        helpers.controllers.control(this, params, controller);

        function controller() {
            var that = this;
            var spec;

            helpers.analytics.reset();
            helpers.analytics.setPage('location');

            if (!params.search) {
                return callback(null, {
                    cities: that.app.getSession('location').topCities.models,
                    target: params.target,
                    analytics: helpers.analytics.generateURL(that.app.getSession())
                });
            }
            spec = {
                cities: {
                    collection: 'Cities',
                    params: {
                        location: that.app.getSession('siteLocation'),
                        name: params.search
                    }
                }
            };
            that.app.fetch(spec, function afterFetch(err, result) {
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
                    posting: params.posting,
                    target: params.target,
                    analytics: helpers.analytics.generateURL(that.app.getSession())
                });
            });
        }
    }
};
