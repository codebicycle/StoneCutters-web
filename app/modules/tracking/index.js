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
    var data; 

    addParam('user', this.app.session.get('user'));
    addParam('rendering', this.app.session.get('platform'));
    data = tracker.generate.call(this, query);
    reset();
    return data;
}

module.exports = {
    google: google,
    ati: ati,
    reset: reset,
    setPage: setPage,
    addParam: addParam,
    generateURL: generateURL
};
