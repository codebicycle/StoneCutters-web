'use strict';

var _ = require('underscore');
var Base = require('rendr/shared/base/model');
var syncer = require('./syncer');
var utils = require('../../shared/utils');

_.extend(Base.prototype, syncer);

module.exports = Base.extend({
    storeKey: function() {
        var options = this.collection ? this.collection.options : this.options;

        return this.get(this.idAttribute) + ':' + JSON.stringify(_.omit(options || {}, 'app', 'params', 'platform', 'parse', this.idAttribute));
    },
    callback: callback,
    errfcb: errfcb,
    fail: fail
});

function callback(done) {
    return done || utils.noop;
}

function errfcb(done) {
    return (done || utils.noop).errfcb || done || utils.noop;
}

function fail(done) {
    return (done || utils.noop).fail || done || utils.noop;
}
