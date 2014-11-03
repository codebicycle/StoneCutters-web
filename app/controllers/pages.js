'use strict';

var middlewares = require('../middlewares');
var asynquence = require('asynquence');
var helpers = require('../helpers');
var Seo = require('../modules/seo');
var tracking = require('../modules/tracking');
var config = require('../../shared/config');
if (typeof window === 'undefined') {
    var statsdModule = '../../server/modules/statsd';
    var statsd = require(statsdModule)();
}

module.exports = {
    terms: middlewares(terms),
    help: middlewares(help),
    interstitial: middlewares(interstitial),
    error: middlewares(error),
    allstates: middlewares(allstates),
    sitemap: middlewares(sitemap),
    featured_listings: middlewares(featuredListings),
    php: middlewares(php)
};

function terms(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        callback(null, {
            tracking: tracking.generateURL.call(this)
        });
    }
}

function help(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        // Delete this callback
        callback(null, {
            tracking: tracking.generateURL.call(this)
        });
        /*
            TODO [MOB-4717] Help.
        var spec = {
            items: {
                collection: 'Help',
                params: params
            }
        };
        */
        /** don't read from cache, because rendr caching expects an array response
        with ids, and smaug returns an object with 'data' and 'metadata' */
        /*
        app.fetch(spec, {
            'readFromCache': false
        }, function afterFetch(err, result) {
            result.items = result.items.models[0].get('data');
            result.platform = app.session.get('platform');
            callback(err, result);
        });
        */
    }
}

function interstitial(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        if (params.downloadApp) {
            this.app.session.persist({
                downloadApp: '1'
            });
            return helpers.common.redirect.call(this, params.ref);
        }

        this.app.session.persist({
            showInterstitial: '1'
        }, {
            maxAge: this.app.session.get('showInterstitial')
        });
        callback(null, {
            tracking: tracking.generateURL.call(this),
            ref: params.ref
        });
    }
}

function error(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var seo = Seo.instance(this.app);
        var err = this.app.session.get('error');
        if (this.app.session.get('isServer')) {
            this.app.req.res.status(404);
            if (this.app.session.get('path') !== '/500') {
                statsd.increment(['All', 'errors', 404]);
            }
            else {
                statsd.increment(['All', 'errors', 500]);
            }
        }
        if (err) {
            this.app.session.clear('error');
        }
        seo.addMetatag('robots', 'noindex, nofollow');
        seo.addMetatag('googlebot', 'noindex, nofollow');
        callback(null, {
            error: err,
            tracking: tracking.generateURL.call(this)
        });
    }
}

function allstates(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var siteLocation = this.app.session.get('siteLocation');

        var decide = function(done) {
            var spec = {
                states: {
                    collection : 'States',
                    params: {
                        location: siteLocation,
                        withCities: true
                    }
                }
            };

            if (params.state) {
                spec.cities = {
                    collection : 'Cities',
                    params : {
                        level: 'states',
                        location : siteLocation.replace('www', params.state),
                        type: 'cities',
                        withStats: true
                    }
                };
            }
            done(spec);
        }.bind(this);

        var fetch = function(done, spec) {
            this.app.fetch(spec, done.errfcb);
        }.bind(this);

        var formatResponse = function(done, res) {
            if (res.cities) {
                var url = siteLocation.replace('www', params.state);
                var currentState = res.states.get(url);

                currentState.set({
                    'children' : res.cities.toJSON(),
                    'selected': true
                });
                res.states.set([currentState]);
            }
            done(res);
        }.bind(this);

        var success = function(response) {
            var meta = response.meta;

            callback(null, {
                states: response.states.toJSON(),
                meta: meta,
                tracking: tracking.generateURL.call(this)
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.redirect.call(this, '/all-states');
        }.bind(this);

        asynquence().or(error)
            .then(decide)
            .then(fetch)
            .then(formatResponse)
            .val(success);
    }
}

function sitemap(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        callback(null, {
            tracking: tracking.generateURL.call(this)
        });
    }
}

function featuredListings(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        callback(null, {

        });
    }
}

function php(params, callback) {
    statsd.increment(['redirections', 'php', this.app.session.get('path')]);
    helpers.common.redirect.call(this, '/');
}
