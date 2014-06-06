'use strict';

var querystring = require('querystring');
var _ = require('underscore');

exports.link = function (href, siteLocation) {
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
        parameters = querystring.parse(parts.join('?'));
    }
    if (_.isObject(name)) {
        parameters = _.extends(parameters, name);
    }
    else if (!value) {
        return parameters[name];
    }
    else {
        parameters[name] = value;
    }
    if (!_.isEmpty(parameters)) {
        out.push('?');
        out.push(querystring.stringify(parameters));
    }
    return out.join('');
}

exports.params = params;
