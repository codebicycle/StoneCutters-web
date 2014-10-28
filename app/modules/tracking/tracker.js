'use strict';

var _ = require('underscore');
var google = require('./google');
var ati = require('./ati');
var keyade = require('./keyade');
var utils = require('../../../shared/utils');
var esi = require('../esi');

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

function generate(query) {
    var page = getURLName.call(this, query.page);
    var location = this.app.session.get('location');
    var urls = [];
    var params = {};
    var sid;
    var url;

    if (google.check.call(this, page) && ati.check.call(this, page)) {
        sid = this.app.session.get('sid');

        if (sid) {
            params.sid = esi.esify.call(this, '$(sid)', sid);
        }
        params.r = esi.esify.call(this, '$rand()', Math.round(Math.random() * 1000000));
        params.referer = esi.esify.call(this, '$url_encode($(HTTP_REFERER|\'-\'))', (this.app.session.get('referer') || '-'));
        params.locNm = location.name;
        params.locId = location.id;
        params.locUrl = location.url;
        ati.generate.call(this, params, page, query.params);
        urls.push('/analytics/pageview.gif?' + stringifyParams(params));
    }

    if (ati.check.call(this, page)) {
        params = _.extend(params, {
            ati: ati.getConfig.call(this)
        });
    }

    return {
        urls: urls,
        params: params
    };
}

module.exports = {
    generate: generate
};