'use strict';

var Base = require('../bases/model');
var asynquence = require('asynquence');
var helpers = require('../helpers');

module.exports = Base.extend({
    idAttribute: 'email',
    parse: parse,
});

module.exports.id = 'Shop';


function parse(resp, options) {

    return Base.prototype.parse.apply(this, arguments);
}

