'use strict';

var _ = require('underscore');
var config = require('../config');
var google = require('./google');
var ati = require('./ati');

var query = {};

function reset() {
    query.page = '';
    query.params = {};
    query.length = 0;
}

function setPage(page) {
    query.page = page;
}

function addParam(name, value) {
    query.params[name] = value;
    query.length++;
}

function stringifyParams(params) {
    var str = [];

    _.each(params, function(value, name) {
        str.push(name + '=' + encodeURIComponent(value));
    });
    return str.join('&');
}

function getURLName(page, currentRoute) {
    if (~page.indexOf('#')) {
        return page;
    }
    
    var name = [];

    name.push(currentRoute.controller);
    name.push('#');
    name.push(currentRoute.action);
    if (page) {
        name.push('#');
        name.push(page);
    }
    return name.join('');
}

function generateURL() {
    var page = getURLName.call(this, query.page, this.app.session.get('currentRoute'));
    var pageGoogle = config.get(['analytics', 'google', 'pages', page], '');
    var configAti = config.get(['analytics', 'ati', 'params', page], {});
    var params = {};

    this.addParam('rendering', this.app.session.get('platform'));

    params.id = config.get(['analytics', 'google', 'id'], 'UA-XXXXXXXXX-X');
    params.random = Math.round(Math.random() * 1000000);
    params.referer = (this.app.session.get('referer') || '-');
    params.page = google.generatePage.call(this, pageGoogle, query.params);
    params.platform = this.app.session.get('platform');
    params.custom = ati.generateParams.call(this, configAti, query.params);

    return '/analytics/pageview.gif?' + stringifyParams(params);
}

module.exports = {
    google: google,
    ati: ati,
    reset: reset,
    setPage: setPage,
    addParam: addParam,
    generateURL: generateURL
};
