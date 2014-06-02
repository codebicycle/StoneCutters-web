'use strict';

var _ = require('underscore');
var helpers = require('../helpers');

module.exports = {
    registration: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            callback(null, {});
        }
    },
    login: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            callback(null, {});
        }
    },
    logout: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var siteLocation = this.app.getSession('siteLocation');

            this.app.deleteSession('user');
            this.redirectTo(helpers.common.link('/', siteLocation), {
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

        function controller() {
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
                    var year = item.date.year;
                    var month = item.date.month - 1;
                    var day = item.date.day;
                    var hour = item.date.hour;
                    var minute = item.date.minute;
                    var second = item.date.second;
                    var date = new Date(year, month, day, hour, minute, second);

                    item.date.since = helpers.timeAgo(date);
                }

                result.myAdsMetadata = myAds.get('metadata');
                result.myAds = myAds.get('data');
                _.each(result.myAds, processItem);
                callback(err, result);
            });
        }
    },
    favorites: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
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
                    var year = item.date.year;
                    var month = item.date.month - 1;
                    var day = item.date.day;
                    var hour = item.date.hour;
                    var minute = item.date.minute;
                    var second = item.date.second;
                    var date = new Date(year, month, day, hour, minute, second);

                    item.date.since = helpers.timeAgo(date);
                }

                result.favoritesMetadata = favorites.get('metadata');
                result.favorites = favorites.get('data');
                _.each(result.favorites, processItem);
                callback(err, result);
            });
        }
    }
};
