'use strict';

var _ = require('underscore');
var helpers = require('../helpers');

module.exports = {
    registration: function(params, callback) {
        var app = helpers.environment.init(this.app);

        callback(null, {
            params: params,
            platform: app.getSession('platform'),
            template: app.getSession('template')
        });
    },
    login: function(params, callback) {
        var app = helpers.environment.init(this.app);

        callback(null, {
            'params': params
        });
    },
    'my-ads': function(params, callback) {
        var app = helpers.environment.init(this.app);
        var siteLocation = app.getSession('siteLocation');
        var user = app.getSession('user') || {};
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
            location: siteLocation,
            item_type: 'myAds'
        });
        app.fetch(spec, function afterFetch(err, result) {
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

            result.platform = app.getSession('platform');
            result.template = app.getSession('template');
            result.dictionary = app.getSession('dictionary');
            result.myAdsMetadata = myAds.get('metadata');
            result.myAds = myAds.get('data');
            result.siteLocation = siteLocation;
            result.params = query;
            _.each(result.myAds, processItem);
            callback(err, result);
        });
    },
    favorites: function(params, callback) {
        var app = helpers.environment.init(this.app);
        var siteLocation = app.getSession('siteLocation');
        var user = app.getSession('user') || {};
        var spec = {
            favorites: {
                collection: 'Items',
                params: {
                    token: user.token
                }
            }
        };

        _.extend(spec.favorites.params, params, {
            location: siteLocation,
            item_type: 'favorites'
        });
        app.fetch(spec, function afterFetch(err, result) {
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

            result.platform = app.getSession('platform');
            result.template = app.getSession('template');
            result.dictionary = app.getSession('dictionary');
            result.favoritesMetadata = favorites.get('metadata');
            result.favorites = favorites.get('data');
            result.siteLocation = siteLocation;
            _.each(result.favorites, processItem);
            callback(err, result);
        });
    }
};
