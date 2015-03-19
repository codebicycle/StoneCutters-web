'use strict';

var _ = require('underscore');
var configTracking = require('../../config');
var config = require('../../../../../shared/config');
var utils = require('../../../../../shared/utils');
var Adapter = require('../../../../../shared/adapters/base');
var statsd = require('../../../../../shared/statsd')();
var trackPages = utils.get(configTracking, ['ninja', 'pages'], []);

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
    var query = getQuery(ninja.params, ninja.config);
    var iv = utils.params(this.app.session.get('url') || '', 'invite');

    if (iv) {
        query.iv = iv.trim();
    }
    query.gp = (_.contains(trackPages, ninja.params.trackPage) ? ninja.params.trackPage : 'other').toLowerCase();

    return utils.params(url, query);
}

function getQuery(params, config) {
    var query = _.extend({}, params, config);

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
