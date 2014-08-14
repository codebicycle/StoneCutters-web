'use strict';

var asynquence = require('asynquence');
var helpers = require('../helpers');
var seo = require('../seo');
var analytics = require('../analytics');
var config = require('../../shared/config');

module.exports = {
    list: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var fetch = function(done) {
                var citiesParams = {
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
                }, done.errfcb);
            }.bind(this);

            var success = function(response) {
                callback(null, {
                    cities: response.cities.toJSON(),
                    search: params.search,
                    posting: params.posting,
                    target: params.target,
                    analytics: analytics.generateURL.call(this)
                });
            }.bind(this);

            var error = function(err, res) {
                return helpers.common.error.call(this, err, res, callback);
            }.bind(this);

            asynquence().or(error)
                .then(fetch)
                .val(success);
        }
    }
};
