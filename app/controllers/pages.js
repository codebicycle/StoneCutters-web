'use strict';

var middlewares = require('../middlewares');
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
    featured_listings: middlewares(featured_listings)
};

function featured_listings(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {
        callback(null, {

        });
    }
}

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
