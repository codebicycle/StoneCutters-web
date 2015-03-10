'use strict';

var statsd = require('../../shared/statsd')();

module.exports = function(params, next) {
    statsd.increment([this.app.session.get('location').abbreviation, 'controllers', this.currentRoute.controller, this.currentRoute.action, this.app.session.get('platform')]);
    next();
};
