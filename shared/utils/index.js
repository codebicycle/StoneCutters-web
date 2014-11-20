'use strict';

var _ = require('underscore');
var qs = require('./querystring');
var time = require('./time');
var linker = require('./linker');
var crypto = require('./crypto');
var isServer = (typeof window === 'undefined');

var defaults = {
    userAgent: 'Mozilla/5.0 (compatible; OlxArwen/1.0; +http://www.olx.com)',
    platform: 'wap'
};

function get(obj, keys, defaultValue) {
    var value;

    if (!Array.isArray(keys)) {
        if (typeof keys === 'undefined') {
            keys = [];
        } else {
            keys = [keys];
        }
    }
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

function noop() {}

module.exports = _.extend({
    isServer: isServer,
    defaults: defaults,
    get: get,
    daysDiff: daysDiff,
    getUserAgent: getUserAgent,
    sort: sort,
    noop: noop
}, qs, time, linker, crypto);
