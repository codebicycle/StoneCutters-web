'use strict';

var querystring = require('querystring');
var _ = require('underscore');

exports.link = function link(href, siteLocation) {
    var parts = href.split('?');
    var params = {};

    href = parts.shift();
    if (parts.length) {
        params = querystring.parse(parts.join('?'));
    }
    if (siteLocation && !~siteLocation.indexOf('www.') && !params.location) {
        params.location = siteLocation;
    }
    if (!_.isEmpty(params)) {
        href += '?' + querystring.stringify(params);
    }
    return href;
};
