'use strict';

var _ = require('underscore');
var ati = require('./ati');
var analytics = require('./analytics');
var serverSide = require('./serverSide');
var keyade = require('./keyade');
var hydra = require('./hydra');
var tagmanager = require('./tagmanager');
var allpages = require('./allpages');
var ninja = require('./ninja');
var adroll = require('./adroll');
var esi = require('../../esi');
var config = require('../../../../shared/config');
var utils = require('../../../../shared/utils');

var trackers = {
    ati: ati,
    analytics: analytics,
    hydra: hydra,
    tagmanager: tagmanager,
    allpages: allpages,
    adroll: adroll
};

_.each(trackers, function each(tracker, name) {
    trackers[name] = function track(done, ctx, options) {
        try {
            if (tracker.isEnabled.call(this, options.page)) {
                ctx.params[name] = tracker.getParams.call(this, options.page, options.query);
            }
        } catch(e) {
            log(e, name);
        }
        done();
    };
});

function serverSideTrack(done, ctx, options) {
    var url;

    try {
        if (serverSide.isEnabled.call(this, options.page)) {
            _.extend(ctx.params, {
                serverSide: serverSide.getParams.call(this, options.page, _.extend({}, options, {
                    atiParams: ctx.params.ati,
                    analyticsParams: ctx.params.analytics
                }))
            });
            url = serverSide.pageview.call(this, ctx.params.serverSide, {
                page: options.page
            });

            if (url) {
                ctx.urls.push(url);
            }
        }
    } catch(e) {
        log(e, 'serverSide');
    }
    done();
}

function keyadeTrack(done, ctx, options) {
    var url;

    try {
        if (keyade.isEnabled.call(this, options.page)) {
            url = keyade.pageview.call(this, null, _.extend({}, options.query, {
                page: options.page
            }));

            if (url) {
                ctx.urls.push(url);
            }
        }
    } catch(e) {
        log(e, 'keyade');
    }
    done();
}

function ninjaTrack(done, ctx, options) {
    var platforms;
    var location;

    try {
        if (ninja.isEnabled.call(this, options.page)) {
            ctx.params.ninja = ninja.getParams.call(this, options.page, options.query);

            if (utils.isServer) {
                location = this.app.session.get('location');
                platforms = config.getForMarket(location.url, ['tracking', 'trackers', 'ninja', 'noscript', 'platforms'], []);
                if (_.contains(platforms, this.app.session.get('platform'))) {
                    ninja.prepareNoScript.call(this, done, ctx, ctx.params.ninja);
                    return;
                }
            }
        }
    } catch(e) {
        log(e, 'ninja');
    }
    done();
}

function colombiaTrack(done, ctx, options) {
    var location = this.app.session.get('location');
    var atiParams;
    var url;

    try {
        if (ati.isEnabled.call(this, options.page)) {
            if (location.url === 'www.olx.com.co') {
                atiParams = ctx.params.ati || ati.getParams.call(this, options.page, options.query);
                url = ati.pageview.call(this, _.extend({}, atiParams, {
                    clientId: this.app.session.get('clientId').substr(24),
                    referer: esi.esify.call(this, '$url_encode($(HTTP_REFERER|\'-\'))', (this.app.session.get('referer') || '-'))
                }));

                ctx.urls.push(url);
            }
        }
    } catch(e) {
        log(e, 'colombia');
    }
    done();
}

function log(e, name) {
    console.log('[OLX_DEBUG]', 'Tracking not found |', name, e instanceof Error ? JSON.stringify(e.stack) : e);
}

module.exports = _.extend(trackers, {
    serverSide: serverSideTrack,
    keyade: keyadeTrack,
    ninja: ninjaTrack,
    colombia: colombiaTrack
});
