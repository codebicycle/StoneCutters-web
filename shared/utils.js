'use strict';

var _ = require('underscore');
var isServer = (typeof window === 'undefined');
var utils = {
    isServer: isServer,
    link: link,
    params: params
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
    if (siteLocation && !~siteLocation.indexOf('www.') && !params.location) {
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
    return out.join('');
}

module.exports = utils;