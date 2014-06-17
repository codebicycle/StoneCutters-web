'use strict';

var _ = require('underscore');
var helpers = require('../helpers');
var config = require('../config');

module.exports = {
    index: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var platform = this.app.session.get('platform');
            var icons = config.get(['icons', platform], []);
            var country = this.app.session.get('location').url;
            var siteLocation = this.app.session.get('siteLocation');

            helpers.analytics.reset();

            helpers.seo.resetHead();
            helpers.seo.addMetatag('title', 'Home');
            helpers.seo.addMetatag('Description', 'This is the home page');
            helpers.seo.addMetatag('robots', 'NOFOLLOW');
            helpers.seo.addMetatag('canonical', 'http://' + siteLocation);
            callback(null, {
                categories: this.app.session.get('categories'),
                icons: (~icons.indexOf(country)) ? country.split('.') : 'default'.split('.'),
                analytics: helpers.analytics.generateURL(this.app.session.get())
            });
        }
    }
};
