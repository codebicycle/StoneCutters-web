'use strict';

var _ = require('underscore');
var querystring = require('querystring');
var config = require('../../config');
var urls = require('../urls');

var analytics = {
    google: require('./google'),
    ati: require('./ati')
};

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

function generateURL(session, page, options) {
    var url = getURLObject(page);
    var customPage = (options ? analytics.google.generatePage(url, options) : page);
    var custom = _.defaults({}, url.ati, options);
    var params = {
        id: config.get(['analytics', 'google', 'id'], 'UA-XXXXXXXXX-X'),
        random: Math.round(Math.random() * 1000000),
        referer: (session.referer || '-'),
        page: customPage,
        platform: session.platform,
        custom: JSON.stringify(custom)
    };

    return '/pageview.gif?' + querystring.stringify(params);
}

module.exports = _.extend({
    generateURL: generateURL
}, analytics);
