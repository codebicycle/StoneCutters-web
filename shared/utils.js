'use strict';

var _ = require('underscore');
var querystring = require('querystring')
var isServer = (typeof window === 'undefined');
var utils = {
    isServer: isServer,
    link: link,
    fullizeUrl: fullizeUrl,
    params: params,
    removeParams: removeParams,
    get: get
};
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

        if (this.session.get('platform') === 'wap' && sid) {
            href = params(href, 'sid', sid);
        }
        return href;
    }
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
    var protocol;
    var host;

    if (href.indexOf('http://')) {
        protocol = app.session.get('protocol');
        host = app.session.get('host');
        href = [protocol, '://', host, (href.indexOf('/') ? '/' : ''), href].join('');
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
        out.push(querystring.stringify(parameters));
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
        out.push(querystring.stringify(parameters));
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
    return _.isFunction(value) ? value : _.clone(value);
}

module.exports = utils;
