'use strict';

var _ = require('underscore');
var helpers = require('../helpers');
var config = require('../config');

module.exports = {
    index: function(params, callback) {
        var app = helpers.environment.init(this.app);
        var analytics = helpers.analytics.generateURL(app.getSession(), '/');

        function getIcons(platform) {
            var icons = config.get(['icons', platform], []);
            var country = app.getSession('location').url;

            return (~icons.indexOf(country)) ? country : 'default';
        }


        if (params.cityId) {
            helpers.environment.updateCity(app, params.cityId);
        }
        helpers.seo.resetHead();
        helpers.seo.addMetatag('title', 'Home');
        helpers.seo.addMetatag('Description', 'This is the home page');
        helpers.seo.addMetatag('robots', 'NOFOLLOW');
        callback(null, {
            categories: app.getSession('categories'),
            icons: getIcons(app.getSession('platform')),
            analytics: analytics
        });
    }
};

