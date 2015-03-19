'use strict';

var _ = require('underscore');
var Seo = require('./models/seo');
var URLParser = require('url');
var utils = require('../../../shared/utils');
var config = require('../../../shared/config');
var configSeo = require('./config');
var defaultConfig = config.get(['markets', 'common', 'seo']);
var environment = config.get(['environment', 'type'], 'production');

function isEnabled(location) {
    return config.getForMarket(location, ['seo', 'enabled'], defaultConfig.enabled);
}

function isCategoryRedirected(location, categoryId) {
    //return config.getForMarket(location, ['categoryTree', environment, 'redirections', categoryId], config.getForMarket(location, ['categoryTree', 'default', 'redirections', categoryId]));
    return false;
}

function desktopizeReplace(url, params) {
    _.each(params, function (value, i) {
        url = url.replace('$' + i, value);
    });
    return url;
}

function desktopizeUrl(url, options, params) {
    var protocol = options.protocol + '://';
    var host = options.host;
    var path = options.path;
    var location = utils.params(url, 'location');
    var exceptions = utils.get(configSeo, ['redirects', 'onDesktop'], {});
    var regexp;
    var match;
    var port;

    url = utils.cleanParams(url);
    _.each(exceptions, function findException(exception) {
        if (!match && (regexp = new RegExp(exception.regexp)).test(path)) {
            match = exception;
        }
    });
    if (match) {
        url = match.url;
        if (match.replace) {
            url = desktopizeReplace(url, match.regexp.exec(path));
        }
        if (match.params && params) {
            url = desktopizeReplace(url, params);
        }
    }
    if (location) {
        host = location.split('.');
    }
    else {
        host = host.split('.');
        host.shift();
        if (options.hasPlatform) {
            host.shift();
        }
        host.unshift('www');
    }
    if (url.slice(0, protocol.length) === protocol) {
        url = URLParser.parse(url);
        url = [url.pathname, (url.search || '')].join('');
    }
    url = [protocol, host.join('.'), url].join('');
    if (url.slice(url.length - 1) === '/') {
        url = url.slice(0, url.length - 1);
    }
    return url;
}
module.exports = _.extend(Seo, {
    isEnabled: isEnabled,
    isCategoryRedirected: isCategoryRedirected,
    desktopizeUrl: desktopizeUrl
});

module.exports = Seo;
