'use strict';

var Base = require('../bases/collection');
var State = require('../models/state');

module.exports = Base.extend({
    model: State,
    url: '/countries/:location/states',
    parse: function(response) {
        if (response && response.data) {
            this.meta = response.metadata;
            return response.data;
        }
        return response;
    }
});

module.exports.id = 'States';
