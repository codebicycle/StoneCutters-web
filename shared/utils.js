'use strict';

var _ = require('underscore');
var isServer = (typeof window === 'undefined');
var utils = {
    isServer: isServer,
    link: link,
    params: params,
    removeParams: removeParams,
    get: get
};

if (isServer) {
    var querystringName = 'querystring';
    utils.qs = require(querystringName);
}
else {
    utils.qs = {
        parse: function () {
            return querystring.parse.apply(querystring, arguments);
        },
        stringify: function () {
            return querystring.stringify.apply(querystring, arguments);
        }
    };
}

function link(href, app, query) {
    var siteLocation = app.session.get('siteLocation');

    query = query || {};
    if (!query.location && siteLocation && !~siteLocation.indexOf('www.')) {
        href = params(href, 'location', siteLocation);
    }
    if (app.session.get('platform') === 'wap') {
        href = params(href, 'sid', app.session.get('sid'));
    }
    if (!_.isEmpty(query)) {
        href = params(href, query);
    }
    return href;
};

function params(url, keys, value) {
    var parts = url.split('?');
    var parameters = {};
    var out = [];

    out.push(parts.shift());
    if (parts.length) {
        parameters = utils.qs.parse(parts.join('?'));
    }
    if (_.isObject(keys)) {
        parameters = _.extend(parameters, keys);
    }
    else if (!value) {
        return parameters[keys];
    }
    else {
        parameters[keys] = value;
    }
    if (!_.isEmpty(parameters)) {
        out.push('?');
        out.push(utils.qs.stringify(parameters));
    }
    if (url.slice(url.length - 1) === '#') {
        out.push('#');
    }
    return out.join('');
}

function removeParams(url, keys) {
    var parts = url.split('?');
    var parameters = {};
    var out = [];

    out.push(parts.shift());
    if (parts.length) {
        parameters = utils.qs.parse(parts.join('?'));
    }
    if (_.isObject(keys)) {
        parameters = _.filter(parameters, function filter(key) {
            return !_.contains(keys, key);
        });
    }
    else {
        delete parameters[keys];
    }
    if (!_.isEmpty(parameters)) {
        out.push('?');
        out.push(utils.qs.stringify(parameters));
    }
    if (url.slice(url.length - 1) === '#') {
        out.push('#');
    }
    return out.join('');
}

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
    return _.clone(value);
}

module.exports = utils;
