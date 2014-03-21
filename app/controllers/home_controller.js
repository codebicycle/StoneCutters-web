'use strict';

var _ = require('underscore');
var helpers = require('../helpers');

module.exports = {
    index: function(params, callback) {
        var app = helpers.environment.init(this.app);

        if (params.cityId)
            helpers.environment.updateCity(app, params.cityId);

        (function fetchWhatsNew() {
            var siteLocation = app.getSession('siteLocation');
            var spec = {
                whatsNewItems: {
                    collection: 'Items',
                    params: {}
                }
            }

            _.extend(spec.whatsNewItems.params, params, {
                location: siteLocation,
                item_type: 'adsList',
                'f.withPhotos': 'true'
            });
            app.fetch(spec, function afterFetch(err, result) {
                var whatsNew = result.whatsNewItems.models[0];

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
                result.categories = app.getSession('categories');
                result.dictionary = app.getSession('dictionary');
                result.whatsNewMetadata = whatsNew.get('metadata');
                result.whatsNewItems = whatsNew.get('data');
                result.firstItem = result.whatsNewItems[0];
                result.siteLocation = siteLocation;
                _.each(result.whatsNewItems, processItem);
                callback(err, result);
            });
        })();
    }
};

