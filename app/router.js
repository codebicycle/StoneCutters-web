'use strict';

var BaseClientRouter = require('rendr/client/router');

var Router = module.exports = function Router(options) {
    BaseClientRouter.call(this, options);
};

var routes = require('./helpers').routes;

var trigger = false;

var extractParamNamesRe = /:(\w+)/g;
var plusRe = /\+/g;

var _ = require('underscore');

/**
 * Set up inheritance.
 */
Router.prototype = Object.create(BaseClientRouter.prototype);
Router.prototype.constructor = BaseClientRouter;

Router.prototype.postInitialize = function() {
    this.on('action:start', this.trackImpression, this);
    this._router.on('route', this.triggerRoute, this);
};

Router.prototype.triggerRoute = function(event) {
    if (trigger) {
        $(document).trigger('route', event);
    }
    trigger = true;
};

Router.prototype.trackImpression = function() {
    if (window._gaq) {
        _gaq.push(['_trackPageview']);
    }
};

Router.prototype.getParamsHash = function(pattern, paramsArray, search) {
    var paramNames;
    var params;
    var query;

    if (pattern instanceof RegExp) {
        var route = Object.keys(routes).filter(function each(route) {
            return route.indexOf(this.currentRoute.controller + '#' + this.currentRoute.action) === 0;
        }.bind(this)).filter(function each(route) {
            return routes[route].urls && new RegExp(routes[route].urls.client.url.toString().slice(1, -1) + '\\/?').toString() === pattern.toString();
        }.bind(this)).shift();

        if (route && routes[route].urls && routes[route].urls.client.params) {
            paramNames = routes[route].urls.client.params;
        }
        else {
            paramNames = paramsArray.map(function(val, i) {
                return String(i);
            });
        }
    }
    else {
        paramNames = (pattern.match(extractParamNamesRe) || []).map(function(name) {
            return name.slice(1);
        });
    }
    params = (paramNames || []).reduce(function(memo, name, i) {
        memo[name] = decodeURIComponent(paramsArray[i]);
        return memo;
    }, {});
    query = search.slice(1).split('&').reduce(function(memo, queryPart) {
        var parts = queryPart.split('=');

        if (parts.length > 1) {
            memo[parts[0]] = decodeURIComponent(parts[1].replace(plusRe, ' '));
        }
        return memo;
    }, {});
    return _.extend(query, params);
};
