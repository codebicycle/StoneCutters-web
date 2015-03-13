'use strict';

var _ = require('underscore');
var configTracking = require('../../config');
var utils = require('../../../../../shared/utils');
var Adapter = require('../../../../../shared/adapters/base');
var statsd = require('../../../../../shared/statsd')();
var trackPages = utils.get(configTracking, ['ninja', 'pages'], []);

function extractTrackPage(params) {
    return params.trackPage;
}

function prepare(done, ctx, ninja) {
    var url;

    try {
        url = getIframeUrl.call(this, ninja);
        requestIframeUrl.call(this, url, onResponse.bind(this));
    } catch(e) {
        log(e, 'ninja all');
        done();
    }

    function onResponse(err, res, body) {
        try {
            if (err) {
                ctx.params.ninja.noscript = ['<iframe src="', url, '" width="1" height="1" marginwidth="1" marginheight="1" frameborder="0"></iframe>'].join('');
            }
            else {
                statsd.increment([this.app.session.get('location').abbreviation, 'tracking', 'ninja', 'success', this.app.session.get('platform')]);
                ctx.params.ninja.noscript = body;
            }
        } catch(e) {
            log(e, 'ninja GA and ATI');
        }
        try {
            ctx.urls.push(getHydraUrl.call(this, ninja));
        } catch(e) {
            log(e, 'ninja HYDRA');
        }
        done();
    }
}

function requestIframeUrl(url, callback) {
    var adapter = new Adapter({});

    adapter.request(this.app.req, {
        method: 'GET',
        url: url,
        headers: {
            Referer: utils.fullizeUrl(this.app.session.get('url'), this.app)
        }
    }, {
        timeout: 100,
        onTimeout: function onTimeout() {
            statsd.increment([this.app.session.get('location').abbreviation, 'tracking', 'ninja', 'error', 'timeout', this.app.session.get('platform')]);
            callback(true);
        }.bind(this)
    }, callback);
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
