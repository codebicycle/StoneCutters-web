'use strict';

var Base = require('../bases/model');

module.exports = Base.extend({
    idAttribute: 'url',
    url: '/countries/:code',
    parse: function(code) {
        return code;
    }
});

module.exports.id = 'Countries';
