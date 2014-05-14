'use strict';

var _ = require('underscore');
var config = require('../../config');
var urls = require('../urls');
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

function generateURL(session) {
    var page = query.page;
    var url = urls[page];
    var params = {};
    
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
