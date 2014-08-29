'use strict';

var _ = require('underscore');
var configAnalytics = require('./config');
var google = require('./google');
var ati = require('./ati');
var utils = require('../../../shared/utils');

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

function checkPage(page) {
    var googlePage = utils.get(configAnalytics, ['google', 'pages', page]);
    var ati = utils.get(configAnalytics, ['ati', 'params', page]);

    return (!!googlePage && !!ati);
}

function generate(query) {
    var page = getURLName.call(this, query.page);
    var urls = [];
    var params = {};
    var location;
    var sid;

    if (checkPage(page)) {
        location = this.app.session.get('location');
        sid = this.app.session.get('sid');

        if (sid) {
            params.sid = sid;
        }
        params.r = Math.round(Math.random() * 1000000);
        params.referer = (this.app.session.get('referer') || '-');
        params.locNm = location.name;
        params.locId = location.id;
        params.locUrl = location.url;
        google.generate.call(this, params, page, query.params);
        ati.generate.call(this, params, page, query.params);
        urls.push('/analytics/pageview.gif?' + stringifyParams(params));
    }

    return {
        urls: urls,
        params: params
    };
}

module.exports = {
    generate: generate
};
