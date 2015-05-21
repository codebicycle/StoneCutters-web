'use strict';

var _ = require('underscore');
var qs = require('./querystring');
var string = require('./string');
var esi = require('../../app/modules/esi');

var linkParams = {
    location: function (href, app, query) {
        var siteLocation = app.session.get('siteLocation');
        var platform = app.session.get('platform');
        var domain = app.session.get('domain');
        var host = app.session.get('shortHost');
        var brand;

        if (platform === 'desktop' && query.location) {
            href = fullizeUrl(href, app);
            href = href.replace(/^(.+:\/\/)[^(:|\/)]*/, '$1' + query.location);
            delete query.location;
        }
        if (platform !== 'desktop' && query.location && siteLocation && query.location.split('.').pop() !== siteLocation.split('.').pop()) {
            brand = domain.split('.').shift();
            host = host.split(brand);
            host[1] = '.' + query.location.split('.').splice(2).join('.');
            href = fullizeUrl(href, app);
            href = href.replace(app.session.get('shortHost'), host.join(brand));
        }
        if (platform !== 'desktop' && !query.location && siteLocation && !~siteLocation.indexOf('www.')) {
            href = params(href, 'location', siteLocation);
        }
        return href;
    },
    language: function (href, app, query) {
        var selectedLanguage;
        var languages;

        if (!query.language) {
            selectedLanguage = app.session.get('selectedLanguage');

            if (selectedLanguage) {
                languages = app.session.get('languages');

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
    sid: function (href, app, query) {
        var sid = app.session.get('sid');
        var platform = app.session.get('platform');
        var originalPlatform = app.session.get('originalPlatform');

        if ((platform === 'wap' || originalPlatform === 'wap') && sid) {
            href = params(href, 'sid', esi.esify.call(app, '$(sid)', sid));
        }
        return href;
    }
};

function checkHref(href) {
    if (href.slice(href.length - 1) === '/') {
        href = href.substring(0, href.length - 1);
    }
    return href;
}

function link(href, app, query) {
    query = query || {};

    _.each(linkParams, function(linkParam) {
        href = linkParam(href, app, query);
    });
    if (!_.isEmpty(query)) {
        href = params(href, query);
    }
    return checkHref(href);
}

function fullizeUrl(href, app) {
    var protocol = app.session.get('protocol') + '://';
    var host;

    if (!string.startsWith(href, protocol)) {
        host = app.session.get('host');
        href = [protocol, host, (href.indexOf('/') ? '/' : ''), href].join('');
    }
    if (app.session.get('platform') === 'desktop') {
        href = href.replace(app.session.get('shortHost'), app.session.get('siteLocation'));
    }
    return checkHref(href);
}

function params(url, keys, value) {
    var parts = url.split('?');
    var parameters = {};
    var out = [];

    out.push(parts.shift());
    if (parts.length) {
        parameters = qs.parse(parts.join('?'));
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
        out.push(qs.stringify(parameters));
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
        parameters = qs.parse(parts.join('?'));
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
        out.push(qs.stringify(parameters));
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

module.exports = {
    link: link,
    fullizeUrl: fullizeUrl,
    params: params,
    removeParams: removeParams,
    cleanParams: cleanParams
};
