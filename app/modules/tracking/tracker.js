'use strict';

var _ = require('underscore');
var google = require('./trackers/google');
var ati = require('./trackers/ati');
var keyade = require('./trackers/keyade');
var hydra = require('./trackers/hydra');
var utils = require('../../../shared/utils');
var esi = require('../esi');

var trackers = {
    serverSide: function(ctx, page, query) {
        var googleEnabled = google.check.call(this, page);
        var atiEnabled = ati.check.call(this, page);
        var params = {};
        var googleParams;
        var atiParams;
        var location;
        var sid;

        if (googleEnabled || atiEnabled) {
            location = this.app.session.get('location');
            sid = this.app.session.get('sid');

            if (sid) {
                params.sid = esi.esify.call(this, '$(sid)', sid);
            }
            params.r = esi.esify.call(this, '$rand()', Math.round(Math.random() * 1000000));
            params.referer = esi.esify.call(this, '$url_encode($(HTTP_REFERER|\'-\'))', (this.app.session.get('referer') || '-'));
            params.locNm = location.name;
            params.locId = location.id;
            params.locUrl = location.url;

            if (googleEnabled) {
                googleParams = google.getParams.call(this, page, query);
                params.page = googleParams.page;
                _.extend(ctx.params, {
                    google: googleParams
                });
            }
            if (atiEnabled) {
                atiParams = ati.getParams.call(this, page, query);
                params.custom = atiParams.custom;
                _.extend(ctx.params, {
                    ati: atiParams
                });
            }

            ctx.urls.push(utils.params('/analytics/pageview.gif?', params));
            _.extend(ctx.params, {
                serverSide: params
            });
        }
    },
    ati: function(ctx, page, query) {
        if (!ctx.params.ati && ati.check.call(this, page)) {
            _.extend(ctx.params, {
                ati: ati.getParams.call(this, page, query)
            });
        }
    },
    google: function(ctx, page, query) {
        if (!ctx.params.google && google.check.call(this, page)) {
            _.extend(ctx.params, {
                google: google.getParams.call(this, page, query)
            });
        }
    },
    hydra: function(ctx, page, query) {
        if (!ctx.params.hydra && hydra.check.call(this, page)) {
            _.extend(ctx.params, {
                hydra: hydra.getParams.call(this, page, query)
            });
        }
    },
    keyade: function(ctx, page, query) {
        var url;

        if (keyade.check.call(this, page)) {
            url = keyade.pageview.call(this, page);

            if (url) {
                ctx.urls.push(url);
            }
        }
    },
    colombia: function(ctx, page, query) {
        var location = this.app.session.get('location');
        var atiParams;
        var url;

        if (ati.check.call(this, page)) {
            if (location.url === 'www.olx.com.co') {
                atiParams = ctx.params.ati || ati.getParams.call(this, page, query);
                url = ati.pageview.call(this, _.extend({}, atiParams, {
                    clientId: this.app.session.get('clientId').substr(24),
                    referer: esi.esify.call(this, '$url_encode($(HTTP_REFERER|\'-\'))', (this.app.session.get('referer') || '-'))
                }));

                ctx.urls.push(utils.params(url.url, url.params));
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
        tracker.call(this, tracking, page, query.params);
    }, this);

    return tracking;
}

module.exports = {
    generate: generate
};
