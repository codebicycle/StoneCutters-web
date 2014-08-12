'use strict';

var _ = require('underscore');
var config = require('../../shared/config');
var utils = require('../../shared/utils');
var tracking = require('../../shared/tracking');
var configAnalytics = require('./config');
var google = require('./google');
var ati = require('./ati');
var esi = require('../esi');

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
        params.clientId = esi.esify.call(this, '$substr($(clientId), 24)', defaults.cliId.substr(24));
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
    return userAgent;
}

function stringifyParams(params) {
    var str = [];

    _.each(params, function(value, name) {
        if (!esi.isEsiString(value)) {
            value = encodeURIComponent(value);
        }
        str.push(name + '=' + value);
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

    params.r = esi.esify.call(this, '$rand()', Math.round(Math.random() * 1000000));
    params.referer = esi.esify.call(this, '$url_encode($(HTTP_REFERER|\'-\'))', (this.app.session.get('referer') || '-'));
    if (sid) {
        params.sid = esi.esify.call(this, '$(sid)', sid);
    }
    params.locNm = location.name;
    params.locId = location.id;
    google.generate.call(this, params, page, query.params);
    ati.generate.call(this, params, page, query.params);

    return params;
}

function generateServerSide(query) {
    var params = generateDefaultParams.call(this, query);

    return {
        urls: ['/analytics/pageview.gif?' + stringifyParams(params)],
        params: params
    };
}

function generateClientSide(query) {
    var urls = [];
    var defaultParams = generateDefaultParams.call(this, query);
    var trackers = config.get(['tracking', 'trackers'], {});
    var paramsGenerator;
    var params;
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
        urls.push([api.url, '?', utils.stringify(api.params)].join(''));
    }, this);

    return {
        urls: urls,
        params: defaultParams
    };
}

function generate(query) {
    var serverSide = config.get(['tracking', 'serverSide'], true);

    if (serverSide) {
        return generateServerSide.call(this, query);
    }
    return generateClientSide.call(this, query);
}

module.exports = {
    generate: generate
};
