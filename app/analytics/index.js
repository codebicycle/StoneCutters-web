'use strict';

var esi = require('../esi');
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
    addParam('rendering', esi.esify.call(this, '$(platform)', this.app.session.get('platform')));
    addParam('user', this.app.session.get('user'));
    return tracker.generateURL.call(this, query);
}

module.exports = {
    google: google,
    ati: ati,
    reset: reset,
    setPage: setPage,
    addParam: addParam,
    generateURL: generateURL
};
