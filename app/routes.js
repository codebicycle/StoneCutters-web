'use strict';

var _ = require('underscore');
var urls = require('./urls');
var isServer = typeof window === 'undefined';

var urlParsers = [
    {
        regexp: /\/\?(:\w+)(\(\[[0-9a-zA-Z\-]+\][+*]\))?\?/g,
        value: '(/)($1)'
    },
    {
        regexp: /\/(:\w+)(\(\[[0-9a-zA-Z\-]+\][+*]\))?\?$/g,
        value: '(/)($1)'
    },
    {
        regexp: /(:\w+)(\(\[[0-9a-zA-Z\-]+\][+*]\))?\?/g,
        value: '($1)'
    },
    {
        regexp: /(:\w+)\(\[[0-9a-zA-Z\-]+\][+*]\)/g,
        value: '$1'
    }
];

function replace(url, parser) {
    return url.replace(parser.regexp, parser.value);
}

function parse(url) {
    _.each(urlParsers, function(parser) {
        url = replace(url, parser);
    });
    return url;
}

function add(match, url, view) {
    if (!isServer && _.isString(url)) {
        url = parse(url);
    }
    if (typeof url === 'undefined') {
        return;
    }
    if (!isServer) {
        if (url instanceof RegExp) {
            url = new RegExp(url.toString().slice(1, -1) + '\\/?');
        }
        else {
            url += '(/)';
        }
    }
    match(url, view);
}

module.exports = function(match) {
    Object.keys(urls).forEach(function each(view) {
        var route = urls[view];

        if (route.urls) {
            return route.urls.forEach(function each(url) {
                add(match, url, view);
            });
        }
        add(match, route.url, view);
    });
};
