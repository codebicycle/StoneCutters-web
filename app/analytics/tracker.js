'use strict';

var _ = require('underscore');
var google = require('./google');
var ati = require('./ati');

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

function generateGoogleUrl(options) {
    var language = this.app.session.get('selectedLanguage');
    var params = {
        id: 'UA-31226936-4',
        page: options.page,
        referer: options.referer,
        ip: this.app.session.get('ip'),
        host: this.app.session.get('host'),
        clientId: this.app.session.get('clientId'),
        hitCount: this.app.session.get('hitCount')
    };
    var ga;

    if (language) {
        params.language = language.toLowerCase();
    }
    ga = google.generateUrl.call(this, params);

    return [ga.url, '?', stringifyParams(ga.params)].join('');
}

function generate(query) {
    var urls = [];
    var page = getURLName.call(this, query.page);
    var sid = this.app.session.get('sid');
    var location = this.app.session.get('location');
    var params = {};
    var ga;

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

    if (_.contains(['www.olx.com.ve', 'www.olx.com.gt', 'www.olx.com.pe'], location.url)) {
        urls.push(generateGoogleUrl.call(this, params));
    }
    return {
        urls: urls,
        params: params
    };
}

module.exports = {
    generate: generate
};
