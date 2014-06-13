'use strict';

var _ = require('underscore');
var helpers = require('../helpers');

module.exports = {
    registration: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller(form) {
            callback(null, {
                form: form,
                agreeTerms: params.agreeTerms
            });
        }
    },
    login: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller(form) {
            callback(null, {
                form: form,
                redirect: params.redirect
            });
        }
    },
    logout: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            this.app.deleteSession('user');
            return helpers.common.redirect.call(this, '/', null, {
                pushState: false
            });
        }
    },
    myolx: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            callback(null, {});
        }
    },
    'my-ads': function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller(form) {
            var user = this.app.getSession('user') || {};
            var spec = {
                myAds: {
                    collection: 'Items',
                    params: {
                        token: user.token
                    }
                }
            };
            var query = _.clone(params);

            _.extend(spec.myAds.params, params, {
                location: this.app.getSession('siteLocation'),
                item_type: 'myAds'
            });
            this.app.fetch(spec, function afterFetch(err, result) {
                var myAds = result.myAds.models[0];

                function processItem(item) {
                    item.date.since = helpers.timeAgo(item.date);

                }

                result.myAdsMetadata = myAds.get('metadata');
                result.myAds = myAds.get('data');
                result.form = form;
                _.each(result.myAds, processItem);
                callback(err, result);
            });
        }
    },
    favorites: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller(form) {
            var user = this.app.getSession('user') || {};
            var spec = {
                favorites: {
                    collection: 'Items',
                    params: {
                        token: user.token
                    }
                }
            };

            _.extend(spec.favorites.params, params, {
                location: this.app.getSession('siteLocation'),
                item_type: 'favorites'
            });
            this.app.fetch(spec, function afterFetch(err, result) {
                var favorites = result.favorites.models[0];

                function processItem(item) {
                    item.date.since = helpers.timeAgo(item.date);
                }

                result.favoritesMetadata = favorites.get('metadata');
                result.favorites = favorites.get('data');
                result.form = form;
                _.each(result.favorites, processItem);
                callback(err, result);
            });
        }
    }
};
