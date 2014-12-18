'use strict';

var _ = require('underscore');
var Base = require('rendr/shared/base/collection');
var syncer = require('./syncer');
var utils = require('../../shared/utils');

_.extend(Base.prototype, syncer);

module.exports = Base.extend({
    parse: parse,
    callback: callback,
    errfcb: errfcb,
    fail: fail
});

function parse(body) {
    if (body && !body.itemProperties) {
        body.itemProperties = {};
    }
    return Base.prototype.parse.apply(this, arguments);
}

function callback(done) {
    return done || utils.noop;
}

function errfcb(done) {
    return (done || utils.noop).errfcb || done || utils.noop;
}

function fail(done) {
    return (done || utils.noop).fail || done || utils.noop;
}
