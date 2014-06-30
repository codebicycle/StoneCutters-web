'use strict';

var helpers = require('../helpers');
var seo = require('../seo');
var analytics = require('../analytics');
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
            if (params.location) {
                seo.addMetatag('robots', 'noindex, follow');
                seo.addMetatag('googlebot', 'noindex, follow');
            }
            this.app.fetch(spec, {
                readFromCache: false
            }, function afterFetch(err, result) {
                analytics.reset();
                callback(err, {
                    cities: result.cities.toJSON(),
                    search: params.search,
                    posting: params.posting,
                    target: params.target,
                    analytics: analytics.generateURL.call(this)
                });
            }.bind(this));
        }
    }
};