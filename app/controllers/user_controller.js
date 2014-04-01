'use strict';

var _ = require('underscore');
var helpers = require('../helpers');

module.exports = {
    registration: function(params, callback) {
        var app = helpers.environment.init(this.app);

        callback(null, {
            'params': params
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

            result.dictionary = app.getSession('dictionary');
            result.myAdsMetadata = myAds.get('metadata');
            result.myAds = myAds.get('data');
            result.siteLocation = siteLocation;
            _.each(result.myAds, processItem);
            console.log(result);
            callback(err, result);
        });
    }
};
