'use strict';

var Base = require('../bases/model');

module.exports = Base.extend({
    idAttribute: 'url',
    url: '/locations/:location',
    parse: function(location) {
        if (location.children && location.children[0]) {
            if (location.children[0].children && location.children[0].children[0]) {
                return location.children[0].children[0];
            }
            return location.children[0];
        }
        return location;
    }
});

module.exports.id = 'City';
