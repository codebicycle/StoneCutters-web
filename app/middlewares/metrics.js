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
    var clear;

    if (_.isEqual(currentRoute, previousRoute)) {
        clear = true;
        if (currentRoute.controller === 'searches' && _.contains(['filter', 'filterig', 'search', 'searchig'], currentRoute.action)) {
            clear = false;
            previousSearch = this.app.session.get('currentSearch');
            if ((params || {}).search !== previousSearch) {
                return statsd.increment([this.app.session.get('location').abbreviation, 'dgd', 'search', 'refine', this.app.session.get('platform')]);
            }
        }
    }
    if (clear) {
        this.app.session.clear('currentSearch');
    }
}
