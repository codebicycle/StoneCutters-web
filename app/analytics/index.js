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
    var platform = this.app.session.get('platform');
    
    if (platform === 'wap' || platform === 'html4') {
        platform = '<esi:vars>$(platform)</esi:vars>';
    }
    addParam('rendering', platform);
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
