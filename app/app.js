'use strict';

var BaseApp = require('rendr/shared/app');
var Session = require('../shared/session');
var helpers = require('./helpers');

/**
 * Extend the `BaseApp` class, adding any custom methods or overrides.
 */
module.exports = BaseApp.extend({
    defaults: {
        templateAdapter: 'rendr-nunjucks'
    },
    /**
     * Client and server.
     *
     * `initialize` is called on app initialize, both on the client and server.
     * On the server, an app is instantiated once for each request, and in the
     * client, it's instantiated once on page load.
     *
     * This is a good place to initialize any code that needs to be available to
     * app on both client and server.
     */
    initialize: function() {
        var host = (function getHost(req) {
            if (req) {
                return req.headers.host;
            }
            return window.location.host;
        })(this.req);
        var index = host.indexOf(':');
        var siteLocation = (index === -1) ? host : host.substring(0,index);

        Session.call(this);
        this.templateAdapter.init(siteLocation.replace('m','www'));
        this.templateAdapter.registerHelpers(helpers.nunjucks.helpers);
        this.templateAdapter.registerExtensions(helpers.nunjucks.extensions);
    },

    /**
    * Client-side only.
    *
    * `start` is called at the bottom of `__layout.hbs`. Calling this kicks off
    * the router and initializes the application.
    *
    * Override this method (remembering to call the superclass' `start` method!)
    * in order to do things like bind events to the router, as shown below.
    */
    start: function() {
        this.router.on('action:start', function onStart() {
            this.set({
                loading: true
            });
        }, this);
        this.router.on('action:end', function onEnd() {
            this.set({
                loading: false
            });
        }, this);
        BaseApp.prototype.start.call(this);
    },

    /**
    * Client-side only.
    *
    * This method also exists on shared/app.js, and is called by client/router.
    * Override it here to specify your own app_view object.
    */
    getAppViewClass: function() {
        return require('./views/app_view');
    }

});
