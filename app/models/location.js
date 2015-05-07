'use strict';

var Base = require('../bases/model');
var LocationModel;

LocationModel = Base.extend({
    idAttribute: 'url',
    url: '/locations/:location',
    parse: parse
});

LocationModel.parseToType = parseToType;

function parse(location) {
    if (location.children && location.children[0]) {
        if (location.children[0].children && location.children[0].children[0]) {
            location.current = location.children[0].children[0];
        }
        else {
            location.current = location.children[0];
        }
    }
    return location;
}

function parseToType(location, memo) {
    if (!location) {
        return memo;
    }
    memo = memo || {};
    memo[location.type] = location;
    if (location.children && location.children.length) {
        return LocationModel.parseToType(location.children[0], memo);
    }
    return memo;
}

module.exports = LocationModel;
module.exports.id = 'Location';
