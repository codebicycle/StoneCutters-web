'use strict';

var Base = require('../bases/collection');
var State = require('../models/state');

module.exports = Base.extend({
    model: State,
    url: '/countries/:location/states',
    parse: function(response) {
        if (response) {
            this.metadata = response.metadata;
            return response.data;
        }
        return response;
    }
});

module.exports.id = 'States';
