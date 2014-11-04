'use strict';

var helpers = require('../helpers');

module.exports = function(params, next) {
    this.app.fetchDependencies(['categories', 'countries', 'states', 'topCities'], function callback(err, response) {
        if (err) {
            return next.fail(err);
        }
        this.dependencies = response;
        next();
    }.bind(this));
};
