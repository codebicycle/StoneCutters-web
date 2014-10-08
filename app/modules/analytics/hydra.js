'use strict';

var _ = require('underscore');
var configAnalytics = require('./config');
var config = require('../../../shared/config');
var utils = require('../../../shared/utils');
var esi = require('../esi');
var env = config.get(['environment', 'type'], 'production');

function check(page) {
    return !!utils.get(configAnalytics, ['hydra', 'pages', page]);
}

function getConfig() {
    var language = this.app.session.get('selectedLanguage');
    var location = this.app.session.get('location');
    var config;

    if (env !== 'production') {
        country = env;
    }
    if (platform !== 'desktop') {
        platform = 'default';
    }

    config = utils.get(configAnalytics, ['ati', 'paths', country, platform], defaultConfig[platform]);
    return _.extend({}, config, {
        host: location.url.replace('www', ''),
        pageName: page,
        params: {
            ivd: 'olx-br_organic',
            cou: location.abbreviation,
            lang: language.split('-').shift(),
            'iid': null,
            'cat': null,
            'specialParam': 'speacialValue'
        }
    });
}

// INIT
var initParams = {
    'ivd': 'olx-br_organic',
    'cou': 'BR',
    'lang': 'PT'
};
//hydra.set('host', 'tracking.olx-st.com:8080');
hydra.set('pageName', '/home/');
hydra.set('params', initParams);

// Track a page
var customParams = {
    'cou': 'BR',
    'iid': null,
    'cat': null,
    // 'ukey'
    // 'uid'
    // 'emd5'
    'specialParam': 'speacialValue',
};
hydra.trackPageView(customParams);

// Track an event
/*
var customParams = {
    'customSpecialParam': 'customSpecialValue'
};
hydra.trackEvent('pepe', customParams);
*/

module.exports = {
    check: check,
    generateUrl: generateUrl
};