'use strict';

var _ = require('underscore');
var restler = require('restler');

function makeTrack(url, options, callback) {
    restler.get(url, options)
        .on('success', success)
        .on('fail', fail)
        .on('error', fail);

    function success(body, res) {
        if (callback) {
            callback(null, body, res);
        }
    }

    function fail(err, res) {
        if (callback) {
            callback(err, res);
        }
    }
}

function serialize(obj) {
    var str = [];
    var key;

    for(key in obj) {
        str.push(key + '=' + encodeURIComponent(obj[key]));
    }
    return str.join("&");
}

function dynamics(obj, params) {
    if (params) {
        if (typeof params === 'function') {
            params = params.call(null, obj);
        }
        if (params === Object(params)) {
            obj = _.defaults({}, params, obj);
        }
    }
    return obj;
}

var Analytic = function(type, options) {
    this.type = type;
    this.options = options;
    this.debug = false;
};

Analytic.types = {
    ati: function(options) {
        var url = [];
        var random = (options.random || Math.round(Math.random() * 1000000));
        var obj = {
            s: options.id,
            stc: options.custom,
            idclient: options.clientId,
            na: random,
            ref: options.referer
        };

        obj = dynamics(obj, options.dynamics);
        url.push('http://');
        url.push(options.host);
        url.push('.ati-host.net/hit.xiti?');
        url.push(serialize(obj));
        
        return url.join('');
    },
    'ati-event': function(options) {
        var url = [];
        var random = (options.random || Math.round(Math.random() * 1000000));
        var obj = {
            xts: options.id,
            p: options.custom,
            clic: 'A',
            type: 'click',
            idclient: options.clientId,
            na: random,
            url: options.url
        };

        obj = dynamics(obj, options.dynamics);
        url.push('http://');
        url.push(options.host);
        url.push('.ati-host.net/go.click?');
        url.push(serialize(obj));
        
        return url.join('');
    },
    __google_internal__: function(options) {
        var random = (options.userId || Math.round(Math.random() * 1000000));
        var today = new Date().getTime().toString();

        return {
            utmwv: '4.4sh',
            utmn: today,
            utmhn: options.host,
            utmr: options.referer,
            utmac: options.id,
            utmcc: '__utma=999.999.999.999.999.1;',
            utmvid: options.clientId,
            utmip: options.ip,
            utmp: options.page
        };
    },
    google: function(options) {
        var url = [];
        var obj = Analytic.types.__google_internal__.call(null, options);

        obj = dynamics(obj, options.dynamics);
        url.push('http://www.google-analytics.com/__utm.gif?');
        url.push(serialize(obj));

        return url.join('');
    },
    'google-event': function(options) {
        var url = [];
        var payload = [];
        var obj = {
            utmt: 'event'
        };
        var objGoogle = Analytic.types.__google_internal__.call(null, options);

        ['category', 'action', 'label'].forEach(function(key) {
            var value = options[key];
            if (value) {
                payload.push(value);
            }
        });
        obj.utme = '5(' + payload.join('*') + ')';

        if (options.value) {
            obj.utme += '(' + Math.round(options.value) + ')';
        }
        if (options.nonInteraction) {
            obj.utmni = 1;
        }
        obj = dynamics(_.defaults(obj, objGoogle), options.dynamics);

        url.push('http://www.google-analytics.com/__utm.gif?');
        url.push(serialize(obj));

        return url.join('');
    }
};

Analytic.prototype.track = function(optionsTrack, optionsRequest, callback) {
    var analytic = Analytic.types[ this.type ];
    var url;

    if (_.isFunction(optionsRequest)) {
        callback = optionsRequest;
        optionsRequest = {};
    }
    if (typeof optionsTrack === 'string') {
        optionsTrack = {
            page: optionsTrack
        };
    }
    if (analytic) {
        url = analytic(_.defaults({}, optionsTrack, this.options));
        optionsRequest = optionsRequest || {};
        if (this.debug) {
            console.log('Analytic [' + this.type + '] - URL ' + url);
        }
        makeTrack(url, optionsRequest, callback);
    }
    return url;
};

module.exports = Analytic;
