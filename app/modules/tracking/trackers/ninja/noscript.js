'use strict';

var _ = require('underscore');
var utils = require('../../../../../shared/utils');
var BaseAdapter = require('../../../../../shared/adapters/base');
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

function get(done, ctx, ninja) {
    try {
        requestForImgs.call(this, ninja, function onResponseImgs(err, res, body) {
            if (err) {
                log(err, 'ninja GA and ATI');
            }
            else {
                ctx.params.ninja.noscript = body;
            }
            try {
                ctx.urls.push(getHydraUrl.call(this, ninja));
            } catch(e) {
                log(e, 'ninja HYDRA');
            }
            done();
        }.bind(this));
    } catch(e) {
        log(e, 'ninja all');
    }
}

function requestForImgs(ninja, callback) {
    var url = 'http://tracking.onap.io/n/ninja.php';
    var query = getQuery(ninja.params, ninja.config);
    var adapter = new BaseAdapter({});

    adapter.request(this.app.req, {
        method: 'GET',
        url: url,
        query: query
    }, callback);
}

function getHydraUrl(ninja) {
    var url = ['http://', (ninja.config.environment ? 'tracking-dev.onap.io/h/' : 'tracking.olx-st.com/h/v2/'), 'ns?'].join('');
    var query = getQuery(ninja.params, ninja.config);
    var iv = utils.params(this.app.session.get('referer') || '', 'invite');

    if (iv) {
        query.iv = iv.trim();
    }
    query.gp = (_.contains(trackPages, ninja.params.trackPage) ? ninja.params.trackPage : 'other').toLowerCase();
    query.t = (new Date()).getTime();

    return utils.params(url, query);
}

function getQuery(params, config) {   
    var query = _.extend({}, params, config);

    if (query.extraPageName) {
        query.extraPageName = JSON.stringify(query.extraPageName);
    }
    return query;
}

function log(e, name) {   
    console.log('[OLX_DEBUG]', 'Tracking not found |', name, e ? (e instanceof Error ? JSON.stringify(e.stack) : JSON.stringify(e)) : '');
}

module.exports = {
    get: get
};
