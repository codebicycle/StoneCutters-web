'use strict';

var _ = require('underscore');
var querystring = require('querystring');
var config = require('../config');
var utils = require('../../shared/utils');
var tracking = require('../../shared/tracking');
var configAnalytics = require('./config');
var google = require('./google');
var ati = require('./ati');

var paramsGenerators = {
    ati: function generateAtiParams(defaults) {
        var env = config.get(['environment', 'type'], 'development');
        var countryId = defaults.locId;
        var params = {};
        var atiConfig;
        
        if (env !== 'production') {
            countryId = 0;
        }
        atiConfig = utils.get(configAnalytics, ['ati', 'paths', countryId]);
        if (atiConfig) {
            params.id = atiConfig.siteId;
            params.host = atiConfig.logServer;
        }
        params.clientId = this.app.session.get('clientId').substr(24);
        return params;
    },
    google: function generateGoogleParams(defaults) {
        var params = {};
        
        params.host = this.app.session.get('host');
        params.clientId = this.app.session.get('visitorId');
        return params;
    }
};

function stringifyParams(params) {
    var str = [];

    _.each(params, function(value, name) {
        if (typeof value === 'string' && !~value.indexOf('<esi:')) {
            value = encodeURIComponent(value);
        }
        str.push(name + '=' + encodeURIComponent(value));
    });
    return str.join('&');
}

function getURLName(page) {
    if (~page.indexOf('#')) {
        return page;
    }
    var name = [];
    var currentRoute = this.app.session.get('currentRoute');

    name.push(currentRoute.controller);
    name.push('#');
    name.push(currentRoute.action);
    if (page) {
        name.push('#');
        name.push(page);
    }
    return name.join('');
}

function generateEsiParams(params) {
    params.random = '<esi:vars>$rand()</esi:vars>';
    params.referer = "<esi:vars>$url_encode($(HTTP_REFERER|'-'))</esi:vars>";
    params.cliId = '<esi:vars>$substr($(clientId), 24)</esi:vars>';
    params.osName = '<esi:vars>$(osName)</esi:vars>';
    params.sid = "<esi:vars>$(QUERY_STRING{'sid'})</esi:vars>";
}

function generateCommonParams(params) {
    params.random = Math.round(Math.random() * 1000000);
    params.referer = (this.app.session.get('referer') || '-');
    params.cliId = this.app.session.get('clientId').substr(24);
    params.osNm = (this.app.session.get('device').osName  || 'Others');
}

function generateDefaultParams(query) {
    var page = getURLName.call(this, query.page);
    var sid = this.app.session.get('sid');
    var location = this.app.session.get('location');
    var platform = this.app.session.get('platform');
    var params = {};

    if (platform === 'wap' || platform === 'html4') {
        generateEsiParams.call(this, params);
    }
    else {
        if (sid) {
            params.sid = sid;
        }
        generateCommonParams.call(this, params);
    }
    params.locNm = location.name;
    params.locId = location.id;
    params.platform = query.platform;
    google.generate.call(this, params, page, query.params);
    ati.generate.call(this, params, page, query.params);

    return params;
}

function generateSingleURL(query) {
    var params = generateDefaultParams.call(this, query);

    return '/analytics/pageview.gif?' + stringifyParams(params);
}

function generateURLs(query) {
    var urls = [];
    var defaultParams = generateDefaultParams.call(this, query);
    // BEGIN - Remove default object when client configuration is found in the master
    var trackers = config.get(['tracking', 'trackers'], {ati: true, google: true, graphite: true});
    // END - Remove default object when client configuration is found in the master
    var paramsGenerator;
    var params;
    var data;
    var api;

    _.each(trackers, function(x, type) {
        if (!tracking.has(type) || tracking.isEvent(type)) {
            return;
        }
        paramsGenerator = paramsGenerators[type];
        if (paramsGenerator) {
            params = paramsGenerator.call(this, defaultParams);
        }
        api = tracking.generate(type, _.defaults({}, params, defaultParams));
        data = {};
        _.each(api.params, function(value, key) {
            data[key] = encodeURIComponent(value);
        });
        urls.push([api.url, '?', querystring.stringify(data)].join(''));
    }, this);
    return urls;
}

function generateURL(query) {
    var serverSide = config.get(['tracking', 'serverSide'], false);

    if (serverSide) {
        return generateSingleURL.call(this, query);
    }
    return generateURLs.call(this, query);
}

module.exports = {
    generateURL: generateURL,
    generateURLs: generateURLs
};
