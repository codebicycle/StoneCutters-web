'use strict';

var helpers = require('../helpers');

module.exports = {
    terms: function(params, callback) {
        var app = helpers.environment.init(this.app);

        callback(null, {
            'params': params
        });
    }
};
