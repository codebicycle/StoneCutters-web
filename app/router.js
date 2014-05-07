'use strict';

var BaseClientRouter = require('rendr/client/router');
var helpers = require('./helpers');

var Router = module.exports = function Router(options) {
    BaseClientRouter.call(this, options);
};

var trigger = false;

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
