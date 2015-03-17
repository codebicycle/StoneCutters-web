'use strict';

var Base = require('../bases/model');
var helpers = require('../helpers');

module.exports = Base.extend({
    idAttribute: 'email',
    parse: parse
});

function parse(resp, options) {
    var item = resp.items[0];

    if (item && item.date) {
        item.date.since = helpers.timeAgo(item.date);
    }
    return Base.prototype.parse.apply(this, arguments);
}

module.exports.id = 'Shop';
