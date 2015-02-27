'use strict';

var _ = require('underscore');
var ati = require('./trackers/ati');
var analytics = require('./trackers/analytics');
var serverSide = require('./trackers/serverSide');
var keyade = require('./trackers/keyade');
var hydra = require('./trackers/hydra');
var tagmanager = require('./trackers/tagmanager');
var allpages = require('./trackers/allpages');
var facebook = require('./trackers/facebook');
var ninja = require('./trackers/ninja');
var adroll = require('./trackers/adroll');
var utils = require('../../../shared/utils');
var esi = require('../esi');

var trackers = {
    ati: ati,
    analytics: analytics,
    hydra: hydra,
    tagmanager: tagmanager,
    allpages: allpages,
    facebook: facebook,
    ninja: ninja,
    adroll: adroll
};

_.each(trackers, function each(tracker, name) {
    trackers[name] = function track(ctx, page, query) {
        if (tracker.isEnabled.call(this, page)) {
            ctx.params[name] = tracker.getParams.call(this, page, query);
        }
    };
}, this);

_.extend(trackers, {
    serverSide: function(ctx, page, query) {
        var url;

        if (serverSide.isEnabled.call(this, page)) {
            _.extend(ctx.params, {
                serverSide: serverSide.getParams.call(this, page, {
                    atiParams: ctx.params.ati,
                    analyticsParams: ctx.params.analytics,
                    query: query
                })
            });
            url = serverSide.pageview.call(this, ctx.params.serverSide, {
                page: page
            });

            if (url) {
                ctx.urls.push(url);
            }
        }
    },
    keyade: function(ctx, page, query) {
        var url;

        if (keyade.isEnabled.call(this, page)) {
            url = keyade.pageview.call(this, null, _.extend({}, query, {
                page: page
            }));

            if (url) {
                ctx.urls.push(url);
            }
        }
    },
    colombia: function(ctx, page, query) {
        var location = this.app.session.get('location');
        var atiParams;
        var url;

        if (ati.isEnabled.call(this, page)) {
            if (location.url === 'www.olx.com.co') {
                atiParams = ctx.params.ati || ati.getParams.call(this, page, query);
                url = ati.pageview.call(this, _.extend({}, atiParams, {
                    clientId: this.app.session.get('clientId').substr(24),
                    referer: esi.esify.call(this, '$url_encode($(HTTP_REFERER|\'-\'))', (this.app.session.get('referer') || '-'))
                }));

                ctx.urls.push(url);
            }
        }
    }
});

function getPageName(page) {
    if (~page.indexOf('#')) {
        return page;
    }
    var name = [];
    var currentRoute = this.app.session.get('currentRoute');

    name.push(currentRoute.controller);
    name.push('#');
    name.push(currentRoute.action);
    if (page) {
        name.push('#');
        name.push(page);
    }
    return name.join('');
}

function generate(query) {
    var page = getPageName.call(this, query.page);
    var tracking = {
        urls: [],
        params: {}
    };

    _.each(trackers, function(tracker, name) {
        try {
            tracker.call(this, tracking, page, query.params);
        } catch(e) {
            console.log('[OLX_DEBUG]', 'Tracking not found |', name, e instanceof Error ? JSON.stringify(e.stack) : e);
        }
    }, this);
    return tracking;
}

module.exports = {
    generate: generate
};
