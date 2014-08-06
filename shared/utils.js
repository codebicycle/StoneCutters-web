'use strict';

var _ = require('underscore');
var querystring = require('querystring');
var esi = require('../app/esi');
var isServer = (typeof window === 'undefined');
var linkParams = {
    location: function (href, query) {
        var siteLocation = this.session.get('siteLocation');

        if (!query.location && siteLocation && !~siteLocation.indexOf('www.')) {
            href = params(href, 'location', siteLocation);
        }
        return href;
    },
    language: function (href, query) {
        var selectedLanguage;
        var languages;

        if (!query.language) {
            selectedLanguage = this.session.get('selectedLanguage');

            if (selectedLanguage) {
                languages = this.session.get('languages');

                if (languages && selectedLanguage === languages.models[0].locale) {
                    href = removeParams(href, 'language');
                }
                else {
                    href = params(href, 'language', selectedLanguage);
                }
            }
        }
        else {
            href = params(href, 'language', query.language);
        }
        return href;
    },
    sid: function (href, query) {
        var sid = this.session.get('sid');
        var platform = this.session.get('platform');
        var originalPlatform = this.session.get('originalPlatform');

        if ((platform === 'wap' || originalPlatform === 'wap') && sid) {
            href = params(href, 'sid', esi.esify.call(this, '$(sid)', sid));
        }
        return href;
    }
};
var defaults = {
    userAgent: 'Mozilla/5.0 (compatible; OlxArwen/1.0; +http://www.olx.com)',
    platform: 'wap'
};

function stringifyPrimitive(v) {
    switch (typeof v) {
        case 'string':
            return v;

        case 'boolean':
            return v ? 'true' : 'false';

        case 'number':
            return isFinite(v) ? v : '';

        default:
            return '';
    }
}

function stringify(obj, sep, eq, name) {
    sep = sep || '&';
    eq = eq || '=';

    if (obj !== null && typeof obj === 'object') {
        return _.map(_.keys(obj), function(k) {
            var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;

            if (_.isArray(obj[k])) {
                return _.map(obj[k], function(v) {
                    v = stringifyPrimitive(v);
                    return ks + (esi.isEsiString(v) ? v : encodeURIComponent(v));
                }).join(sep);
            } 
            else {
                k = stringifyPrimitive(obj[k]);
                return ks + (esi.isEsiString(k) ? k : encodeURIComponent(k));
            }
        }).join(sep);
    }

    if (!name) {
        return '';
    }
    obj = stringifyPrimitive(obj);
    return encodeURIComponent(stringifyPrimitive(name)) + eq + (esi.isEsiString(obj) ? obj : encodeURIComponent(obj));
}

function link(href, app, query) {
    query = query || {};
    _.each(linkParams, function(checker, name) {
        href = checker.call(app, href, query);
    });
    if (!_.isEmpty(query)) {
        href = params(href, query);
    }
    return href;
}

function fullizeUrl(href, app) {
    var protocol = app.session.get('protocol') + '://';
    var host;

    if (href.slice(0, protocol.length) !== protocol) {
        host = app.session.get('host');
        href = [protocol, host, (href.indexOf('/') ? '/' : ''), href].join('');
    }
    return href;
}

function params(url, keys, value) {
    var parts = url.split('?');
    var parameters = {};
    var out = [];

    out.push(parts.shift());
    if (parts.length) {
        parameters = querystring.parse(parts.join('?'));
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
        out.push(stringify(parameters));
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
        parameters = querystring.parse(parts.join('?'));
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
        out.push(stringify(parameters));
    }
    if (url.slice(url.length - 1) === '#') {
        out.push('#');
    }
    return out.join('');
}

function cleanParams(url) {
    var parts = url.split('?');
    var out = [];

    out.push(parts.shift());
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
    return _.isFunction(value) ? value : _.clone(value);
}

module.exports = {
    isServer: isServer,
    link: link,
    fullizeUrl: fullizeUrl,
    params: params,
    removeParams: removeParams,
    cleanParams: cleanParams,
    get: get,
    stringify: stringify,
    defaults: defaults
};
