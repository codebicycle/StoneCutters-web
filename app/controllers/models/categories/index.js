'use strict';

var Base = require('../bases/controller');
var List = require('./actions/list');
var Show = require('./actions/show');
var ShowIg = require('./actions/showig');

var Categories = Base.extend({
    list: list,
    show: show,
    showig: showig
});

function list(params, callback) {
    return Base.prototype.control.call(this, List, arguments);
}

function show(params, callback) {
    return Base.prototype.control.call(this, Show, arguments);
}

function showig(params, callback) {
    arguments[arguments.length] = '-ig';
    return Base.prototype.control.call(this, ShowIg, arguments);
}

module.exports = new Categories();
