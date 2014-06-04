'use strict';

var _ = require('underscore');
var config = require('../../config');
var routes = require('../routes');
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

function getURLName(session, page) {
    var name = [];
    var currentRoute = session.currentRoute;
    name.push(currentRoute.controller);
    name.push('#');
    name.push(currentRoute.action);
    if (page) {
        name.push('#');
        name.push(page);
    }
    return name.join('');
}

function generateURL(session) {
    var page = getURLName(session, query.page);
    var url = routes[page];
    var params = {};

    this.addParam('rendering', session.platform);

    params.id = config.get(['analytics', 'google', 'id'], 'UA-XXXXXXXXX-X');
    params.random = Math.round(Math.random() * 1000000);
    params.referer = (session.referer || '-');
    params.page = google.generatePage(url, query.params);
    params.platform = session.platform;
    params.custom = ati.generateParams(session, url, query.params);

    return '/pageview.gif?' + stringifyParams(params);
}

module.exports = {
    google: google,
    ati: ati,
    reset: reset,
    setPage: setPage,
    addParam: addParam,
    generateURL: generateURL
};
