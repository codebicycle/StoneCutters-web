'use strict';

var _ = require('underscore');
var URLParse = require('url');
var helpers = require('../helpers');
var rules = [{
    check: function check(params) {
        var path = this.app.session.get('path');

        return (path.length > 1 && path.slice(-1) === '/');
    },
    url: function url(params) {
        var path = this.app.session.get('path');

        return URLParse.parse(this.app.session.get('url')).path.replace(path, path.slice(0, -1));
    }
}, {
    check: function check(params) {
        var currentRoute = this.currentRoute;
        var isAdsensePage = currentRoute.controller === 'searches' || (_.contains(['items', 'categories'], currentRoute.controller) && currentRoute.action === 'show');
        var url = this.app.session.get('url').indexOf('@');

        return isAdsensePage && ~this.app.session.get('url').indexOf('@');
    },
    url: function url(params) {
        var path = this.app.session.get('path');

        return URLParse.parse(this.app.session.get('url').replace(/@/g, '')).path;
    }
}];

module.exports = function(params, next) {
    var rule = _.find(rules, function each(rule) {
        return rule.check.call(this, params);
    }, this);

    if (rule) {
        next.abort();
        return helpers.common.redirect.call(this, rule.url.call(this, params));
    }
    next();
};
