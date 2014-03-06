'use strict';

var BaseApp = require('rendr/shared/app');
var handlebarsHelpers = require('./lib/handlebarsHelpers');
var customHandlebarsHelpers = require('./helpers/customHandlebarsHelpers');

/**
 * Extend the `BaseApp` class, adding any custom methods or overrides.
 */
module.exports = BaseApp.extend({

    /**
     * Client and server.
     *
     * `postInitialize` is called on app initialize, both on the client and server.
     * On the server, an app is instantiated once for each request, and in the
     * client, it's instantiated once on page load.
     *
     * This is a good place to initialize any code that needs to be available to
     * app on both client and server.
     */
    postInitialize: function() {

        /**
         * Register our Handlebars helpers.
         *
         * `this.templateAdapter` is, by default, the `rendr-handlebars` module.
         * It has a `registerHelpers` method, which allows us to register helper
         * modules that can be used on both client & server.
         */
        this.templateAdapter.registerHelpers(handlebarsHelpers);
        this.templateAdapter.registerHelpers(customHandlebarsHelpers);

        //set the platform in the layout template
        if (typeof global !== 'undefined') {
            this.req.app.locals({
                platform: global.platform,
                template: global.template,
                path: global.path,
                url: global.url,
                viewType: global.viewType,
                siteLocation: global.siteLocation,
            });
        }
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

        // Show a loading indicator when the app is fetching.
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

        // Call 'super'.
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
