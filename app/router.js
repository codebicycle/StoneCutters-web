'use strict';

var BaseClientRouter = require('rendr/client/router');
var BaseView = require('./localized/common/app/bases/view');

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
    this.on('action:start', this.setReferer, this);
    this.on('action:start', this.trackImpression, this);
    this._router.on('route', this.triggerRoute, this);
};

Router.prototype.triggerRoute = function(event) {
    if (trigger) {
        $(document).trigger('route', event);
    }
    trigger = true;
};

Router.prototype.setReferer = function(event) {
    if (this.previousFragment) {
        this.app.session.update({
            referer: '/' + this.previousFragment
        });
    }
};

Router.prototype.trackImpression = function() {
    if (window._gaq) {
        _gaq.push(['_trackPageview']);
    }
    if (window._trq) {
        window._trq.push(function track(t) {
            t.track({
                url: 'http://tracking.olx-st.com/h/imgt/mob/web/',
                host: window.location.hostname
            });
        });
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
        memo[name] = decodeURIComponent(paramsArray[i] || '');
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

Router.prototype.getControllerPath = function(controllerName) {
    return this.options.paths.controllerDir + '/' + controllerName;
};

Router.prototype.getRenderCallback = function(route) {
  return function renderCallback(err, viewPath, locals) {
    if (err) {
        return this.handleErr(err, route);
    }

    var _router = this;
    var View;
    if (this.currentView) {
        this.currentView.remove();
    }
    var defaults = this.defaultHandlerParams(viewPath, locals, route);

    viewPath = defaults[0];
    locals = defaults[1];
    locals = locals || {};
    _.extend(locals, {
        fetch_summary: BaseView.extractFetchSummary(this.app.modelUtils, locals)
    });
    locals.app = this.app;
    this.getView(this.app, viewPath, this.options.entryPath, function callback(View) {
        _router.currentView = new View(locals);
        _router.renderView();
        _router.trigger('action:end', route, false);
    });
  }.bind(this);
};

Router.prototype.getView = function(app, key, entryPath, callback) {
    BaseView.getView(app, key, entryPath, function done(View) {
        if (!_.isFunction(View)) {
            throw new Error("View '" + key + "' not found.");
        }
        callback(View);
    });
};
