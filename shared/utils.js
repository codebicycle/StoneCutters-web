'use strict';

var _ = require('underscore');
var isServer = (typeof window === 'undefined');
var utils = {
    isServer: isServer,
    link: link,
    params: params,
    removeParams: removeParams
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

function link(href, siteLocation) {
    if (siteLocation && !~siteLocation.indexOf('www.')) {
        href = params(href, 'location', siteLocation);
    }
    return href;
};

function params(url, name, value) {
    var parts = url.split('?');
    var parameters = {};
    var out = [];

    out.push(parts.shift());
    if (parts.length) {
        parameters = utils.qs.parse(parts.join('?'));
    }
    if (_.isObject(name)) {
        parameters = _.extend(parameters, name);
    }
    else if (!value) {
        return parameters[name];
    }
    else {
        parameters[name] = value;
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

function removeParams(url, name) {
    var parts = url.split('?');
    var parameters = {};
    var out = [];

    out.push(parts.shift());
    if (parts.length) {
        parameters = utils.qs.parse(parts.join('?'));
    }
    if (_.isObject(name)) {
        parameters = _.filter(parameters, function filter(key) {
            return !_.contains(name, key);
        });
    }
    else {
        delete parameters[name];
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

module.exports = utils;