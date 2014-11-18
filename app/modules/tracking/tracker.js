'use strict';

var _ = require('underscore');
var ati = require('./trackers/ati');
var analytics = require('./trackers/analytics');
var hydra = require('./trackers/hydra');
var serverSide = require('./trackers/serverSide');
var keyade = require('./trackers/keyade');
var utils = require('../../../shared/utils');
var esi = require('../esi');

var trackers = {
    ati: function(ctx, page, query) {
        if (ati.isEnabled.call(this, page)) {
            _.extend(ctx.params, {
                ati: ati.getParams.call(this, page, query)
            });
        }
    },
    analytics: function(ctx, page, query) {
        if (analytics.isEnabled.call(this, page)) {
            _.extend(ctx.params, {
                analytics: analytics.getParams.call(this, page, query)
            });
        }
    },
    hydra: function(ctx, page, query) {
        if (hydra.isEnabled.call(this, page)) {
            _.extend(ctx.params, {
                hydra: hydra.getParams.call(this, page, query)
            });
        }
    },
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
            url = keyade.pageview.call(this, null, {
                page: page
            });

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
};

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
            console.log('[OLX_DEBUG]', 'Tracking not found |', name);
        }
    }, this);
    return tracking;
}

module.exports = {
    generate: generate
};
