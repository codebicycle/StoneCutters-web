'use strict';

var _ = require('underscore');
var urls = require('./urls');
var config = require('./urls/config');
var isServer = typeof window === 'undefined';

function parse(url) {
    _.each(config.regexps, function(parser) {
        url = url.replace(parser.regexp, parser.value);
    });
    return url;
}

function replace(url) {
    _.each(config.params, function(value, name) {
        url = url.replace('{{' + name + '}}', value);
    });
    return url;
}

function add(match, url, view) {
    if (_.isString(url)) {
        url = replace(url);
    }
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
