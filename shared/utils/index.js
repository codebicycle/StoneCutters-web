'use strict';

var _ = require('underscore');
var qs = require('./querystring');
var time = require('./time');
var linker = require('./linker');
var string = require('./string');
var crypto = require('./crypto');
var array = require('./array');
var isServer = (typeof window === 'undefined');

var defaults = {
    userAgent: 'Mozilla/5.0 (compatible; OlxArwen/1.0; +http://www.olx.com)',
    platform: 'wap'
};

function get(obj, keys, defaultValue) {
    var value;

    keys = toArray(keys);
    if (typeof defaultValue === 'undefined') {
        defaultValue = null;
    }
    if (!keys.length) {
        return defaultValue || obj;
    }
    keys.every(function iterate(key, index) {
        try {
            if (!index) {
                value = obj[key];
            }
            else {
                value = value[key];
            }
        }
        catch (err) {
            value = null;
            return false;
        }
        return true;
    });
    if (typeof value === 'undefined' || value === null) {
        return defaultValue;
    }
    return _.isFunction(value) ? value : _.clone(value);
}

function daysDiff(date) {
    var now = new Date();
    var diff = now.getTime() - date.getTime();

    return Math.abs(Math.round(diff / (24 * 60 * 60 * 1000)));
}

function getUserAgent(req) {
    if (!isServer) {
        return '';
    }
    return /*req.header('device-stock-ua') || req.header('x-operamini-phone-ua') || */req.get('user-agent') || defaults.userAgent;
}

function sort(params, comparator) {
    var sorted = {};

    _.chain(params).keys().sort(comparator).forEach(function(key) {
        sorted[key] = params[key];
    });
    return sorted;
}

function toArray(value) {
    if (!Array.isArray(value)) {
        if (typeof value === 'undefined') {
            value = [];
        } else {
            value = [value];
        }
    }
    return value;
}

function keysToLowerCase(source) {
    var keys = Object.keys(source);
    var length = keys.length;
    var target = {};
    var key;

    while (length--) {
      key = keys[length];
      target[key.toLowerCase()] = source[key];
    }
    return target;
}

function getUrlParam(param) {
    var url = window.location.search.substring(1);
    var query = url.split('&');

    for (var i = 0; i < query.length; i++) {
        var paramName = query[i].split('=');

        if (paramName[0] == param) {
            return paramName[1];
        }
    }
}

function noop() {}

module.exports = _.extend({
    isServer: isServer,
    defaults: defaults,
    get: get,
    daysDiff: daysDiff,
    getUserAgent: getUserAgent,
    sort: sort,
    toArray: toArray,
    keysToLowerCase: keysToLowerCase,
    getUrlParam: getUrlParam,
    noop: noop
}, qs, time, linker, string, crypto, array);
