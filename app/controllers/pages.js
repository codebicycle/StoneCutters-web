'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var middlewares = require('../middlewares');
var helpers = require('../helpers');
var config = require('../../shared/config');
var statsd = require('../../shared/statsd')();
var Item = require('../models/item');

module.exports = {
    terms: middlewares(terms),
    about: middlewares(about),
    help: middlewares(help),
    interstitial: middlewares(interstitial),
    error: middlewares(error),
    allstates: middlewares(allstates),
    sitemap: middlewares(sitemap),
    sitemapByDate: middlewares(sitemapByDate),
    thanks: middlewares(thanks),
    shops: middlewares(shops),
    shop: middlewares(shop)
};

function terms(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var platform = this.app.session.get('platform');
        var location = this.app.session.get('location');
        var terms = _.contains(config.get(['terms', platform]), location.url) ? location.url : 'default';

        callback(null, {
            terms: terms
        });
    }
}

function about(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        callback(null, {});
    }
}

function help(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var platform = this.app.session.get('platform');
        var location = this.app.session.get('location');

        var tab = 'new-olx';
        var active = params.active;
        var isContactEnabled = helpers.features.isEnabled.call(this, 'contactForm', platform, location.url);

        if (active && active !== 'about' && !isContactEnabled) {
            tab = 'faq';
        } else if (active && active !== 'about') {
            tab = 'contact';
        } else if ( active === 'about' ){
            tab = 'about';
        }

        // Delete this callback
        callback(null, {
            active: params.active,
            tab: tab,
            isContactEnabled: isContactEnabled
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
        var redirect = function(done) {
            var platform = this.app.session.get('platform');

            if (platform !== 'html4' || _.isEmpty(params)) {
                done.abort();
                return helpers.common.redirect.call(this, '/');
            }
            if (params.downloadApp) {
                done.abort();
                this.app.session.persist({
                    downloadApp: '1'
                });
                return helpers.common.redirect.call(this, params.ref);
            }
            done();
        }.bind(this);

        var success = function() {
            this.app.seo.addMetatag('robots', 'noindex, nofollow');
            this.app.seo.addMetatag('googlebot', 'noindex, nofollow');
            this.app.session.persist({
                showInterstitial: '1'
            }, {
                maxAge: this.app.session.get('showInterstitial')
            });
            callback(null, {
                ref: params.ref
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(redirect)
            .val(success);
    }
}

function error(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var err = this.app.session.get('error');
        var location = this.app.session.get('location') || {};

        if (this.app.session.get('isServer')) {
            this.app.req.res.status(404);
        }
        statsd.increment([location.abbreviation || 'all', 'errors', this.app.session.get('path') !== '/500' ? 404 : 500]);
        if (err) {
            this.app.session.clear('error');
        }
        this.app.seo.addMetatag('robots', 'noindex, nofollow');
        this.app.seo.addMetatag('googlebot', 'noindex, nofollow');
        callback(null, {
            error: err
        });
    }
}

function allstates(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var location = this.app.session.get('location');
        var siteLocation = location.url;
        var shortHost = this.app.session.get('shortHost');
        var protocol = this.app.session.get('protocol');
        var host = this.app.session.get('host');
        var url;

        var redirect = function(done) {
            var platform = this.app.session.get('platform');

            if (platform !== 'desktop') {
                done.abort();
                return helpers.common.error.call(this, null, {}, callback);
            }

            if (location.current && location.current.url && !~location.current.url.indexOf('www.')) {
                url = [protocol, '://', host.replace(shortHost, siteLocation), '/all-states'].join('');
                return helpers.common.redirect.call(this, url);
            }

            done();
        }.bind(this);

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
            this.app.fetch(spec, {
                readFromCache: !this.app.session.get('isServer'),
                store: true
            }, done.errfcb);
        }.bind(this);

        var formatResponse = function(done, response) {
            var url = siteLocation.replace('www', params.state);
            var state = response.states.get(url);

            if (!params.state) {
                return done({
                    states: response.states.toJSON(),
                    meta: response.states.meta
                });
            }
            state = state.toJSON();
            state.children = response.cities.toJSON();
            state.selected = true;
            done({
                states: [state],
                meta: response.states.meta
            });
        }.bind(this);

        var success = function(response) {
            this.app.seo.addMetatag('robots', 'noindex, follow');
            this.app.seo.addMetatag('googlebot', 'noindex, follow');
            callback(null, response);
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.redirect.call(this, '/all-states');
        }.bind(this);

        asynquence().or(error)
            .then(redirect)
            .then(decide)
            .then(fetch)
            .then(formatResponse)
            .val(success);
    }
}

function sitemap(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var redirect = function(done) {
            var platform = this.app.session.get('platform');

            if (platform !== 'desktop') {
                return done.fail();
            }
            done();
        }.bind(this);

        var success = function() {
            callback(null, {});
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(redirect)
            .val(success);
    }
}

function sitemapByDate(params, callback) {
    helpers.common.redirect.call(this, '/', null, {
        status: 302
    });
}

function thanks(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        asynquence().or(fail.bind(this))
            .then(redirect.bind(this))
            .val(success.bind(this));

        function redirect(done) {
            var platform = this.app.session.get('platform');
            var location = this.app.session.get('location');

            if (platform !== 'desktop' && platform !== 'html5') {
                return done.fail();
            }

            if(!helpers.features.isEnabled.call(this, 'landingThanks', platform, location.url)) {
                done.abort();
                return helpers.common.redirect.call(this, '/');
            }
            done();
        }

        function success() {
            var location = this.app.session.get('location');

            this.app.seo.addMetatag('title', 'Thank You! & Gracias! & Obrigado!');

            if (location.url == 'www.olx.com.ar') {
                this.app.seo.addMetatag('og:image', helpers.common.static.call(this, '/images/desktop/marketing/thanks/FacebookShare_LATAM.jpg'));
            }

            callback(null, {});
        }

        function fail(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }
    }
}

function shops(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var platform = this.app.session.get('platform');

        if (platform !== 'html4') {
            return helpers.common.redirect.call(this, '/');
        }
        callback(null, {});
    }
}

function shop(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        var platform = this.app.session.get('platform');

        if (platform !== 'html4') {
            return helpers.common.redirect.call(this, '/');
        }
        callback(null, {});
    }
}
