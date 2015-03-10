'use strict';

var _ = require('underscore');
var utils = require('../../../../../shared/utils');
var trackPages = [
    'home',
    'resultset',
    'item',
    'replyform',
    'replysent',
    'postingformstep1',
    'postingformstep2',
    'postingformstep3',
    'postingsent',
    'editformstep1',
    'editformstep2',
    'editformstep3',
    'editsent',
    'notfound'
];

function prepare(done, ctx, ninja) {
    try {
        ctx.params.ninja.noscript = getIframeUrl.call(this, ninja);
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

function getIframeUrl(ninja) {
    var url = 'http://tracking.onap.io/n/ninja.php';
    var query = getQuery(ninja.params, ninja.config);

    return utils.params(url, query);
}

function getHydraUrl(ninja) {
    var url = ['http://', (ninja.config.environment ? 'tracking-dev.onap.io/h/' : 'tracking.olx-st.com/h/v2/'), 'ns?'].join('');
    var query = getQuery(ninja.params, ninja.config);
    var iv = utils.params(this.app.session.get('referer') || '', 'invite');

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
