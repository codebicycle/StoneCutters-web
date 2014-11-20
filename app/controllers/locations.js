'use strict';

var asynquence = require('asynquence');
var middlewares = require('../middlewares');
var helpers = require('../helpers');
var tracking = require('../modules/tracking');
var config = require('../../shared/config');

module.exports = {
    list: middlewares(list)
};

function list(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var redirect = function(done) {
            var platform = this.app.session.get('platform');

            if (platform === 'desktop') {
                return done.fail();
            }
            done();
        }.bind(this);

        var fetch = function(done) {
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
                this.app.seo.addMetatag('robots', 'noindex, follow');
                this.app.seo.addMetatag('googlebot', 'noindex, follow');
            }
            if (params.target && params.target === 'posting') {
                tracking.setPage('post#location');
                this.app.seo.addMetatag('robots', 'noindex, nofollow');
                this.app.seo.addMetatag('googlebot', 'noindex, nofollow');
            }
            this.app.fetch({
                cities: {
                    collection: 'Cities',
                    params: citiesParams
                }
            }, {
                readFromCache: false,
                store: true
            }, done.errfcb);
        }.bind(this);

        var success = function(response) {
            callback(null, {
                cities: response.cities.toJSON(),
                search: params.search,
                posting: params.posting,
                target: params.target
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(redirect)
            .then(fetch)
            .val(success);
    }
}
