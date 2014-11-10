'use strict';

var config = require('../../../shared/config');
var tracker = require('./tracker');
var analytics = require('./trackers/analytics');
var ati = require('./trackers/ati');

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
    var location = this.app.session.get('location');
    var data;

    if (!config.getForMarket(location.url, ['tracking', 'enabled'], true)) {
        return;
    }

    addParam('user', this.app.session.get('user'));
    addParam('rendering', this.app.session.get('platform'));
    data = tracker.generate.call(this, query);
    reset();
    return data;
}

module.exports = {
    analytics: analytics,
    ati: ati,
    reset: reset,
    setPage: setPage,
    addParam: addParam,
    generateURL: generateURL
};
