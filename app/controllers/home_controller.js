'use strict';

var _ = require('underscore');
var helpers = require('../helpers');
var config = require('../config');

module.exports = {
    index: function(params, callback) {
        helpers.controllers.control(this, params, controller);

        function controller() {
            var platform = this.app.getSession('platform');
            var icons = config.get(['icons', platform], []);
            var country = this.app.getSession('location').url;

            helpers.seo.resetHead();
            helpers.seo.addMetatag('title', 'Home');
            helpers.seo.addMetatag('Description', 'This is the home page');
            helpers.seo.addMetatag('robots', 'NOFOLLOW');
            callback(null, {
                categories: this.app.getSession('categories'),
                icons: (~icons.indexOf(country)) ? country : 'default'
            });
        }
    }
};
