'use strict';

var _ = require('underscore');
var statsd = require('../../shared/statsd')();

module.exports = function(params, next) {
    var session = (this.app.session.get('user')) ? 'logged':'anonymous';
    statsd.increment([this.app.session.get('location').abbreviation, 'controllers', this.currentRoute.controller, this.currentRoute.action, session, this.app.session.get('platform')]);
    searchRefine.call(this, params);
    setOrigin.call(this, params);
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

function setOrigin() {
    if (this.currentRoute.controller === 'searches' || (this.currentRoute.controller === 'categories' && this.currentRoute.action !== 'list')) {
        this.app.session.persist({
            origin: {
                type: getType.call(this),
                isGallery: ~this.app.session.get('path').indexOf('-ig')
            }
        });
    }
}

function getType() {
    if (this.currentRoute.controller === 'searches' && _.contains(['filter', 'filterig', 'search', 'searchig'], this.currentRoute.action)) {
        return 'search';
    }
    return 'browse';
}
