'use strict';

var _ = require('underscore');
var config = require('./config');

var Tracking = function() {};
var GoogleEventsKeys = {
    ec: 'category',
    ea: 'action',
    el: 'label',
    ev: 'value'
};

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

Tracking.types = {
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
        var random = (options.userId || Math.round(Math.random() * 1000000));
        var today = new Date().getTime().toString();
        var params = {
            v: '1',
            tid: options.id,
            cid: options.clientId,
            t: 'pageview',
            dh: options.host,
            dp: options.page,
            dr: options.referer
        };

        if (options.ip) {
            params.uip = options.ip;
        }
        if (options.userAgent) {
            params.ua = options.userAgent;
        }
        return params;
    },
    google: function(options) {
        var url = 'http://www.google-analytics.com/collect';
        var params = Tracking.types.__google_internal__.call(null, options);

        params = dynamics(params, options.dynamics);
        params.z = Math.round(Math.random() * 1000000);
        return {
            url: url,
            params: params
        };
    },
    'google-event': function(options) {
        var url = 'http://www.google-analytics.com/collect';
        var params = Tracking.types.__google_internal__.call(null, options);

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
    },
    graphite: function(options) {
        var url = '/analytics/graphite.gif';
        var params = {
            id: options.id,
            host: options.host,
            referer: options.referer,
            page: options.page,
            locId: options.locId,
            locNm: options.locNm,
            platform: options.platform,
            metric: 'pageview',
            random: Math.round(Math.random() * 1000000)
        };
        params = dynamics(params, options.dynamics);
        return {
            url: url,
            params: params
        };
    }
};

Tracking.has = function(type) {
    var exists = typeof Tracking.types[ type ] !== 'undefined';

    if (exists && !config.get(['tracking', 'trackers', type, 'enabled'], true)) {
        exists = false;
    }
    return exists;
};

Tracking.isEvent = function(type) {
    // BEGIN - Remove this block code when client configuration is found in the master
    var eventKey = '-event';
    if (type.length >= eventKey.length && type.slice(type.length - eventKey.length) === eventKey) {
        return true;
    }
    // END - Remove this block code when client configuration is found in the master
    return config.get(['tracking', 'trackers', type, 'isEvent'], false);
};

Tracking.generate = function(type, optionsTrack, debug, force) {
    var tracker;
    var api;

    if (!Tracking.has(type) && !force) {
        if (debug) {
            console.log('Tracker', type, ' not exists or is disabled');
        }
        return;
    }
    if (_.isString(optionsTrack)) {
        optionsTrack = {
            page: optionsTrack
        };
    }
    tracker = Tracking.types[ type ];
    api = tracker(_.clone(optionsTrack));
    if (debug && api) {
        console.log('Tracking', type);
        console.log(' URL', api.url);
        console.log(' Params', api.params);
    }
    return api;
};

module.exports = Tracking;
