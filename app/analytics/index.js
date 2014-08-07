'use strict';

var tracker = require('./tracker');
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

function generateURL() {
    var analytics;

    addParam('user', this.app.session.get('user'));
    addParam('rendering', this.app.session.get('platform'));
    analytics = tracker.generate.call(this, query);
    analytics.params.host = this.app.session.get('host');
    return analytics;
}

module.exports = {
    google: google,
    ati: ati,
    reset: reset,
    setPage: setPage,
    addParam: addParam,
    generateURL: generateURL
};
