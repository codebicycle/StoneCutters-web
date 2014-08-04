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
        params.clientId = defaults.cliId.substr(24);
        return params;
    },
    google: function generateGoogleParams(defaults) {
        var params = {};
        
        params.host = this.app.session.get('host');
        params.clientId = defaults.cliId;
        params.userAgent = getUserAgent.call(this);
        return params;
    }
};

function getUserAgent() {
    var userAgent;
    var device;

    if (this.app.session.get('isServer')) {
        userAgent = this.app.req.get('user-agent') || utils.defaults.userAgent;
        device = this.app.session.get('device');
console.log(device);
        if (device.browserName == 'Opera Mini') {
            ['device-stock-ua', 'x-operamini-phone-ua'].forEach(function(header) {
                header = this.app.req.header(header);
                if (header) {
                    userAgent = header;
                }
            });
        }
    }
    else {
        userAgent = window.navigator.userAgent;
    }
console.log(userAgent);
    return userAgent;
}

function stringifyParams(params) {
    var str = [];

    _.each(params, function(value, name) {
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

function generateDefaultParams(query) {
    var page = getURLName.call(this, query.page);
    var sid = this.app.session.get('sid');
    var location = this.app.session.get('location');
    var params = {};

    if (sid) {
        params.sid = sid;
    }
    params.random = Math.round(Math.random() * 1000000);
    params.referer = (this.app.session.get('referer') || '-');
    params.platform = this.app.session.get('platform');
    params.locNm = location.name;
    params.locId = location.id;
    params.cliId = this.app.session.get('clientId');
    params.osNm = (this.app.session.get('device').osName  || 'Others');
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
    var serverSide = config.get(['tracking', 'serverSide'], true);

    if (serverSide) {
        return generateSingleURL.call(this, query);
    }
    return generateURLs.call(this, query);
}

module.exports = {
    generateURL: generateURL,
    generateURLs: generateURLs
};
