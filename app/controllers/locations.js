'use strict';

var helpers = require('../helpers');
var analytics = require('../analytics');
var config = require('../config');

module.exports = {
    list: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            analytics.reset();

            if (!params.search) {
                return callback(null, {
                    cities: this.app.session.get('location').topCities.models,
                    target: params.target,
                    analytics: analytics.generateURL.call(this)
                });
            }
            this.app.fetch({
                cities: {
                    collection: 'Cities',
                    params: {
                        location: this.app.session.get('siteLocation'),
                        name: params.search
                    }
                }
            }, function afterFetch(err, result) {
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
                    analytics: analytics.generateURL.call(this)
                });
            }.bind(this));
        }
    }
};
