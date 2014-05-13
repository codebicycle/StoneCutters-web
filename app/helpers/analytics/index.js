'use strict';

var _ = require('underscore');
var config = require('../../config');
var urls = require('../urls');
var google = require('./google');
var ati = require('./ati');

var query = {};

function reset() {
    query.page = '';
    query.params = {};
    query.length = 0;
}

function setPage(page) {
    query.page = page;
}

function addParam(name, value) {
    query.params[name] = value;
    query.length++;
}

function pathRegexp(path, sensitive, strict) {
    if ({}.toString.call(path) == '[object RegExp]') {
        return path;
    }
    if (Array.isArray(path)) {
        path = '(' + path.join('|') + ')';
    }
    if ('/' != path[0]) {
        path = '/' + path;
    }
    path = path
        .concat(strict ? '' : '/?')
        .replace(/\/\(/g, '(?:/')
        .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, optional, star) {
            slash = slash || '';
            return [(optional ? '' : slash),
                    '(?:', (optional ? slash : ''), (format || ''), (capture || (format && '([^/.]+?)' || '([^/]+?)')), ')',
                    (optional || ''),
                    (star ? '(/*)?' : '')].join('');
        })
        .replace(/([\/.])/g, '\\$1')
        .replace(/\*/g, '(.*)');
    return new RegExp('^' + path + '$', sensitive ? '' : 'i');
}

function getURLObject(page) {
    var url;
    var regExp;
    var keys;

    for (url in urls) {
        keys = [];
        regExp = pathRegexp(url, true, false);
        if (regExp.exec(page)) {
            return urls[ url ];
        }
    }
}

function stringifyParams(params) {
    var str = [];

    _.each(params, function(value, name) {
        str.push(name + '=' + encodeURIComponent(value));
    });
    return str.join('&');
}

function generateURL(session) {
    var page = query.page;
    var url = getURLObject(page);
    var params = {};
    
    if (query.length) {
        page = google.generatePage(url, query.params);
    }
    params.id = config.get(['analytics', 'google', 'id'], 'UA-XXXXXXXXX-X');
    params.random = Math.round(Math.random() * 1000000);
    params.referer = (session.referer || '-');
    params.page = page;
    params.platform = session.platform;
    params.custom = ati.generateParams(session, url, query.params);

    return '/pageview.gif?' + stringifyParams(params);
}

module.exports = {
    google: google,
    ati: ati,
    reset: reset,
    setPage: setPage,
    addParam: addParam,
    generateURL: generateURL
};
