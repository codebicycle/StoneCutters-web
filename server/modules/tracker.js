'use strict';

var _ = require('underscore');
var restler = require('restler');
var crypto = require('crypto');

var GoogleEventsKeys = {
    ec: 'category',
    ea: 'action',
    el: 'label',
    ev: 'value'
};

function noop() {}

function dynamics(defaults, params) {
    if (params) {
        if (_.isFunction(params)) {
            params = params.call(null, defaults);
        }
        if (_.isObject(params)) {
            defaults = _.defaults({}, params, defaults);
        }
    }
    return defaults;
}

function prepare(options, params) {
    options = _.defaults(options, {
        method: 'get',
        query: params
    });

    if (options.method === 'post') {
        options.data = options.query;
        delete options.query;
    }
    return options;
}
var Tracker = function(type, options) {
    this.type = type;
    this.options = options;
    this.debug = false;
};

Tracker.types = {
    ati: function(options) {
        var url = ['http://', options.host, '.ati-host.net/hit.xiti'].join('');
        var random = (options.random || Math.round(Math.random() * 1000000));
        var params = {
            s: options.id,
            stc: options.custom,
            idclient: options.clientId,
            na: random,
            ref: options.referer
        };

        params = dynamics(params, options.dynamics);
        return {
            url: url,
            params: params
        };
    },
    'ati-event': function(options) {
        var url = ['http://', options.host, '.ati-host.net/go.click'].join('');
        var random = (options.random || Math.round(Math.random() * 1000000));
        var params = {
            xts: options.id,
            p: options.custom,
            clic: 'A',
            type: 'click',
            idclient: options.clientId,
            na: random,
            url: options.url
        };

        params = dynamics(params, options.dynamics);
        return {
            url: url,
            params: params
        };
    },
    __google_internal__: function(options) {
        var params = {
            v: '1',
            tid: options.id,
            cid: options.clientId,
            t: 'pageview',
            dh: options.host,
            dp: options.page,
            dr: options.referer,
            ul: options.language
        };

        if (options.ip) {
            params.uip = options.ip;
        }
        if (options.hitCount) {
            params._s = options.hitCount;
        }
        return params;
    },
    google: function(options) {
        var url = 'http://www.google-analytics.com/collect';
        var params = Tracker.types.__google_internal__.call(null, options);

        params = dynamics(params, options.dynamics);
        params.z = Math.round(Math.random() * 1000000);
        return {
            url: url,
            params: params
        };
    },
    googleGA: function(options) {
        var url = 'http://www.google-analytics.com/__utm.gif';
        var utmvid = '0x' + crypto.createHash('md5').update(options.clientId).digest('hex').substr(0, 16);
        var params = {
            utmwv: '5.5.4',
            utms: options.hitCount,
            utmhn: options.host,
            utmn: Math.round(Math.random() * 1000000),
            utmr: options.referer,
            utmp: options.page,
            utmac: options.id,
            utmcc: (options.visitor || '__utma%3D999.999.999.999.999.1%3B'),
            utmvid: utmvid,
            utmip: options.ip
        };

        if (options.custom) {
            params.utme = options.custom;
        }
        if (options.language) {
            params.utmul = options.language;
        }

        params = dynamics(params, options.dynamics);
        return {
            url: url,
            params: params
        };
    },
    'google-event': function(options) {
        var url = 'http://www.google-analytics.com/collect';
        var params = Tracker.types.__google_internal__.call(null, options);

        params.t = 'event';
        _.each(GoogleEventsKeys, function(value, key) {
            if (options[value]) {
                params[key] = options[value];
            }
        });
        params = dynamics(params, options.dynamics);
        params.z = Math.round(Math.random() * 1000000);
        return {
            url: url,
            params: params
        };
    }
};

Tracker.prototype.track = function(options, optionsRequest, callback) {
    var tracking = Tracker.types[this.type];
    var api;

    if (_.isUndefined(tracking)) {
        console.log('[OLX_DEBUG] Invalid tracker type [', this.type, ']');
        return;
    }
    options = _.defaults({}, options, this.options);
    api = tracking.call(this, _.clone(options));
    if (api) {
        if (_.isFunction(optionsRequest)) {
            callback = optionsRequest;
            optionsRequest = {};
        }
        restler.request(api.url, prepare(optionsRequest || {}, api.params))
            .on('success', (callback || noop))
            .on('fail', (callback || noop))
            .on('error', (callback || noop));
        return api.url;
    }
};

module.exports = Tracker;
