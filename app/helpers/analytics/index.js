'use strict';

var _ = require('underscore');
var querystring = require('querystring');
var config = require('../../config');
var urls = require('../urls');

var analytics = {
    google: require('./google'),
    ati: require('./ati')
};
var query = {};

function reset() {
    query.page = '';
    query.params = {};
    query.length = 0;
    addParam('id', config.get(['analytics', 'google', 'id'], 'UA-XXXXXXXXX-X'));
    addParam('random', Math.round(Math.random() * 1000000));
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

function stringifyParams() {
    var params = [];

    _.each(query.params, function(value, name) {
        params.push(name + '=' + encodeURIComponent(value));
    });
    return params.join('&');
}

function generateURL(session) {
    var page = query.page;
    var url = getURLObject(page);

    if (query.length) {
        page = analytics.google.generatePage(url, query.params);
    }
    addParam('referer', (session.referer || '-'));
    addParam('page', page);
    addParam('platform', session.platform);
    addParam('custom', analytics.ati.getParams(url, query.params));

    return '/pageview.gif?' + stringifyParams();
}

module.exports = _.extend({
    reset: reset,
    setPage: setPage,
    addParam: addParam,
    generateURL: generateURL
}, analytics);
