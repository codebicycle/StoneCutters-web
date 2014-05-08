'use strict';

var isClient = typeof window !== 'undefined';

function noop() {}

function getAll() {
    var cookies = {};

    if (document.cookie) {
        document.cookie.split(';').forEach(function each(cookie) {
            cookie = cookie.split('=');
            cookies[cookie[0]] = cookie[1];
        });
    }
    return cookies;
}

function get(key, dephault) {
    var cookies = this.getAll();
    var value = cookies[key];

    return (typeof value === 'undefined' ? dephault : value);
}

function put(key, value, options) {
    var cookie = key + '=' + value;

    options = options || {};
    for (var option in options) {
        cookie += '; ' + option + '=' + options[option];
    }
    document.cookie = cookie;
}

function clear(key, options) {
    var expires = new Date();

    expires.setMonth(-1);
    put(key, '', {
        expires: expires.toUTCString()
    });
}

module.exports = {
    getAll: isClient ? getAll : noop,
    get: isClient ? get : noop,
    put: isClient ? put : noop,
    clear: isClient ? clear : noop
};
