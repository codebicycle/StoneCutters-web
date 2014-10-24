'use strict';

var Base = require('../bases/model');

module.exports = Base.extend({
    idAttribute: 'url',
    parse: function(state) {
        state.hostname = state.url.split('.').shift();
        return state;
    }
});

module.exports.id = 'State';
