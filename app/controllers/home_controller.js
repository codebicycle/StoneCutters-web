'use strict';

var _ = require('underscore');
var helpers = require('../helpers');
var config = require('../config');

module.exports = {
    index: function(params, callback) {
        var app = helpers.environment.init(this.app);

        function getIcons(platform) {
            var icons = config.get(['icons', platform], []);
            var country = app.getSession('location').url;

            return (~icons.indexOf(country)) ? country : 'default';
        }
        
        function done(err) {
            helpers.analytics.reset();
            helpers.analytics.setPage('/');
            callback(err, {
                categories: app.getSession('categories'),
                icons: getIcons(app.getSession('platform')),
                analytics: helpers.analytics.generateURL(app.getSession())
            });
        }

        helpers.seo.resetHead();
        helpers.seo.addMetatag('title', 'Home');
        helpers.seo.addMetatag('Description', 'This is the home page');
        helpers.seo.addMetatag('robots', 'NOFOLLOW');
        if (params.cityId) {
            helpers.environment.updateCity(app, params.cityId, done);
        }
        else {
            done();
        }
    }
};

