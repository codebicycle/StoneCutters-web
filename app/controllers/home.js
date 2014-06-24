'use strict';

var _ = require('underscore');
var helpers = require('../helpers');
var config = require('../config');

module.exports = {
    index: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            helpers.controllers.changeHeaders.call(this, config.get(['cache', 'headers', 'home'], config.get(['cache', 'headers', 'default'], {})));

            var platform = this.app.session.get('platform');
            var icons = config.get(['icons', platform], []);
            var country = this.app.session.get('location').url;
            var siteLocation = this.app.session.get('siteLocation');

            this.app.fetch({
                categories: {
                    collection: 'Categories',
                    params: {
                        location: siteLocation,
                        languageCode: this.app.session.get('selectedLanguage')
                    }
                }
            }, {
                readFromCache: false
            }, function afterFetch(err, result) {
                helpers.analytics.reset();
                helpers.seo.resetHead();
                helpers.seo.addMetatag('title', 'Home');
                helpers.seo.addMetatag('Description', 'This is the home page');
                helpers.seo.addMetatag('robots', 'NOFOLLOW');
                helpers.seo.addMetatag('canonical', 'http://' + siteLocation);
                callback(null, {
                    categories: result.categories.toJSON(),
                    icons: (~icons.indexOf(country)) ? country.split('.') : 'default'.split('.'),
                    analytics: helpers.analytics.generateURL(this.app.session.get())
                });
            }.bind(this));
        }
    }
};
