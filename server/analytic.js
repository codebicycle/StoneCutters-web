'use strict';

var restler = require('restler');

function defaults(obj) {
    var slice = Array.prototype.slice;

    slice.call(arguments, 1).forEach(function(source) {
        if (source) {
            for (var prop in source) {
                if (obj[prop] === void 0) {
                    obj[prop] = source[prop];
                }
            }
        }
    });
    return obj;
}

function makeTrack(url, callback) {
    restler.get(url)
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
            obj = defaults({}, params, obj);
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
            utmhn: options.host,
            utmp: options.page,
            utmac: options.id,
            utmip: options.ip,
            utmn: today,
            guid: 'ON',
            utmv: '1',
            utmr: options.referer,
            utmcc: ['__utma=', random, '.', Math.round(Math.random() * 1000000), '.', today, '.', today, '.', today, '.3; __utmz=', random, '.', today, '.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none);'].join('')
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
            if (value !== null) {
                payload.push(value);
            }
        });
        obj.utme = '5(' + payload.join('*') + ')';

        if (options.value !== null) {
            obj.utme += '(' + Math.round(options.value) + ')';
        }
        if (options.nonInteraction) {
            obj.utmni = 1;
        }
        obj = dynamics(defaults(obj, objGoogle), options.dynamics);

        url.push('http://www.google-analytics.com/__utm.gif?');
        url.push(serialize(obj));

        return url.join('');
    }
};

Analytic.prototype.trackPage = function(options, callback) {
    var analytic = Analytic.types[ this.type ];
    var url;

    if (typeof options === 'string') {
        options = {
            page: options
        };
    }
    if (analytic) {
        url = analytic(defaults({}, options, this.options));
        if (this.debug) {
            console.log('Analytic [' + this.type + '] - URL [' + url + ']');
        }
        makeTrack(url, callback);
    }
    return url;
};

module.exports = Analytic;
