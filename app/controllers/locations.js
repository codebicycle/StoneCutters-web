'use strict';

var helpers = require('../helpers');
var config = require('../config');

module.exports = {
    list: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var spec = {
                cities: {
                    collection: 'Cities',
                    params: {
                        type: 'topcities',
                        location: this.app.session.get('siteLocation')
                    }
                }
            };

            if (params.search) {
                spec.cities.params.type = 'cities';
                spec.cities.params.name = params.search;
            }
            this.app.fetch(spec, {
                readFromCache: false
            }, function afterFetch(err, result) {
                helpers.analytics.reset();
                callback(err, {
                    cities: result.cities.toJSON(),
                    search: params.search,
                    posting: params.posting,
                    target: params.target,
                    analytics: helpers.analytics.generateURL(this.app.session.get())
                });
            }.bind(this));
        }
    }
};
