'use strict';

var _ = require('underscore');
var statsd = require('../../shared/statsd')();

module.exports = function(params, next) {
    statsd.increment([this.app.session.get('location').abbreviation, 'controllers', this.currentRoute.controller, this.currentRoute.action, this.app.session.get('platform')]);
    searchRefine.call(this, params);
    next();
};

function searchRefine(params) {
    var previousRoute = this.app.session.get('currentRoute');
    var currentRoute = this.currentRoute;
    var previousSearch;

    if (_.isEqual(currentRoute, previousRoute)) {
        if (currentRoute.controller === 'searches' && _.contains(['filter', 'filterig', 'search', 'searchig'], currentRoute.action)) {
            previousSearch = this.app.session.get('currentSearch');

            if ((params || {}).search !== previousSearch) {
                statsd.increment([this.app.session.get('location').abbreviation, 'dgd', 'search', 'refine', this.app.session.get('platform')]);
            }
        }
    }
}
