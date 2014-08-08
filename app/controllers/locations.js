'use strict';

var helpers = require('../helpers');
var seo = require('../seo');
var analytics = require('../analytics');
var config = require('../config');

module.exports = {
    list: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var citiesParams = {
                level: 'countries',
                type: 'topcities',
                location: this.app.session.get('siteLocation')
            };

            if (params.search) {
                citiesParams.type = 'cities';
                citiesParams.name = params.search;
            }
            if (params.location) {
                seo.addMetatag('robots', 'noindex, follow');
                seo.addMetatag('googlebot', 'noindex, follow');
            }
            analytics.reset();
            if (params.target && params.target === 'posting') {
                analytics.setPage('post#location');
                seo.addMetatag('robots', 'noindex, nofollow');
                seo.addMetatag('googlebot', 'noindex, nofollow');
                seo.update();
            }
            this.app.fetch({
                cities: {
                    collection: 'Cities',
                    params: citiesParams
                }
            }, {
                readFromCache: false
            }, function afterFetch(err, result) {
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
