'use strict';

var _ = require('underscore');
var configTracking = require('../../config');
var config = require('../../../../../shared/config');
var utils = require('../../../../../shared/utils');
var Adapter = require('../../../../../shared/adapters/base');
var statsd = require('../../../../../shared/statsd')();
var trackPages = utils.get(configTracking, ['ninja', 'pages'], []);
var rSession = /([a-z0-9]+)-([0-9]+)-([a-z0-9]+)-([0-9]+)-([0-9]+)-?(.*)?/;
var rCookie = /[^\w\-\=]/g;

function extractTrackPage(params) {
    return params.trackPage;
}

function isPlatformEnabled(platforms) {
    var enabled = true;

    if (platforms && !_.contains(platforms, this.app.session.get('platform'))) {
        enabled = false;
    }
    return enabled;
}

function isEnabled(type) {
    var location = this.app.session.get('location');
    var enabled = config.getForMarket(location.url, ['tracking', 'trackers', 'ninja', 'trackers', type, 'enabled'], true);

    if (enabled) {
        enabled = isPlatformEnabled.call(this, config.getForMarket(location.url, ['tracking', 'trackers', 'ninja', 'trackers', type, 'platforms']));
    }
    return enabled;
}

function prepare(done, ctx, ninja) {
    var url;

    ctx.params.ninja.noscript = {
        urls: []
    };

    if (isEnabled.call(this, 'hydra')) {
        try {
            ctx.params.ninja.noscript.urls.push(getHydraUrl.call(this, ninja));
        } catch(e) {
            log(e, 'ninja HYDRA');
        }
    }
    if (isEnabled.call(this, 'others')) {
        try {
            url = getIframeUrl.call(this, ninja);
            return requestIframeUrl.call(this, url, onResponse.bind(this));
        } catch(e) {
            log(e, 'ninja all');
        }
    }
    done();

    function onResponse(err, res, body) {
        try {
            if (err) {
                ctx.params.ninja.noscript.iframe = url;
            }
            else {
                statsd.increment([this.app.session.get('location').abbreviation, 'tracking', 'ninja', 'success', this.app.session.get('platform')]);
                ctx.params.ninja.noscript.body = body;
            }
        } catch(e) {
            log(e, 'ninja GA and ATI');
        }
        done();
    }
}

function requestIframeUrl(url, callback) {
    var adapter = new Adapter({});
    var options = getRequestOptions.call(this, url);

    adapter.request(this.app.req, options, {
        timeout: 100,
        onTimeout: function onTimeout() {
            statsd.increment([this.app.session.get('location').abbreviation, 'tracking', 'ninja', 'error', 'timeout', this.app.session.get('platform')]);
            callback(true);
        }.bind(this)
    }, callback);
}

function getRequestOptions(url) {
    var options = {
        method: 'GET',
        url: url
    };

    if (utils.isServer) {
        options.headers = {
            Referer: utils.fullizeUrl(this.app.session.get('url'), this.app)
        };
    }
    return options;
}

function getIframeUrl(ninja) {
    var url = 'http://tracking.onap.io/n/ninja.php';
    var query = getQuery(ninja.params, ninja.config);

    return utils.params(url, query);
}

function getHydraUrl(ninja) {
    var url = ['http://', (ninja.config.environment ? 'tracking-dev.onap.io/h/' : 'tracking.olx-st.com/h/v2/'), 'ns?'].join('');
    var sessionParams;
    var query;
    var iv;

    if (_.contains(['wap', 'html4'], this.app.session.get('platform'))) {
        sessionParams = generateSessionParams.call(this);
    }
    query = getQuery(sessionParams, ninja.params, ninja.config);
    iv = utils.params(this.app.session.get('url') || '', 'invite');
    if (iv) {
        query.iv = iv.trim();
    }
    query.gp = (_.contains(trackPages, ninja.params.trackPage) ? ninja.params.trackPage : 'other').toLowerCase();

    return utils.params(url, query);
}

function generateSessionParams() {
    var now = (Math.round(_.now() / 1000));
    var sessionValues = this.app.session.get('onap');
    var sessionCountLong = 1;
    var sessionCount = 1;
    var sessionExpired;
    var sessionExtra;
    var sessionLong;
    var session;
    var cookieValue;
    var match;

    if (sessionValues) {
        match = sessionValues.match(rSession);
        if (match && match.length >= 4) {
            sessionLong = match[1];
            sessionCountLong = Number(match[2]);
            session = match[3];
            sessionCount = Number(match[4]);
            sessionExpired = match[5];
            sessionExtra = match[6];

            if ((sessionExpired - now) > 0) {
                sessionCount = sessionCount + 1;
            }
            else {
                sessionCountLong = sessionCountLong + 1;
                session = generateSession();
                sessionCount = 1;
            }
        }
    }
    sessionLong = sessionLong || generateSession();
    session = session || sessionLong;

    cookieValue = [sessionLong, sessionCountLong, session, sessionCount, (now + 1800)];
    if (sessionExtra !== undefined) {
        cookieValue.push(sessionExtra);
    }
    this.app.session.persist({
        onap: cookieValue.join('-').replace(rCookie, '')
    }, {
        maxAge: utils.YEAR
    });

    return {
        sl: sessionLong,
        s: session,
        cl: sessionCountLong,
        c: sessionCount
    };
}

function generateSession() {
    return [Number(_.now()).toString(16), Number(Math.floor((Math.random() * 2147483647) + 1)).toString(16)].join('x');
}

function getQuery(params, config) {
    var query = _.extend({}, params || {}, config);

    if (query.extraPageName) {
        query.extraPageName = JSON.stringify(query.extraPageName);
    }
    query.t = _.now();
    return query;
}

function log(e, name) {
    console.log('[OLX_DEBUG]', 'Tracking not found |', name, e ? (e instanceof Error ? JSON.stringify(e.stack) : JSON.stringify(e)) : '');
}

module.exports = {
    prepare: prepare
};
