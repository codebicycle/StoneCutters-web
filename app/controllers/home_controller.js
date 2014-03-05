'use strict';

var _ = require('underscore');
var EnvHelper = require('../helpers/env_helper');
var timeAgo = require('../helpers/time_ago_helper').timeAgo;

module.exports = {
    index: function(params, callback) {
        var paramsWhatsNew = {};
        _.extend(paramsWhatsNew, params);
        var paramsLastVisited = {};
        _.extend(paramsLastVisited, params);
        EnvHelper.setUrlVars(this.app);
        if (params.cityId) {
            var city = this.app.get('baseData').location.cities._byId[params.cityId];
            this.app.get('baseData').siteLocation = city.url;
            this.app.get('baseData').location.city = city;
        }
        var siteLocation = this.app.get('baseData').siteLocation;
        var platform = this.app.get('baseData').platform;
        var categories = this.app.get('baseData').categories;
        var dictionary = this.app.get('baseData').dictionary;

        //Setting up the photo filters.
        paramsWhatsNew.item_type = 'adsList';
        paramsWhatsNew.location = siteLocation;
        params.location = siteLocation;
      	paramsWhatsNew['f.withPhotos'] = 'true';

        /** TODO we have to implement a real last visited filter.
        paramsLastVisited.item_type = 'adsList';
        TODO remove hardcoded location. Should come from local storage or cookie
        paramsLastVisited.location = 'www.olx.com.ar'; */
        var spec = {
            whatsNewItems: {
                collection: 'Items',
                params: paramsWhatsNew
            }
        };
        this.app.fetch(spec, function afterFetch(err, result) {
            /** TODO global is not defined in the client anymore
            You can use this.app.get('baseData').button_color if defined in
            the fetchBaseData middleware
            result.button_color = global.button_color; */
            result.categories = categories;
            result.siteLocation = siteLocation;
            result.platform = platform;
            result.whatsNewMetadata = result.whatsNewItems.models[0].get('metadata');
            result.whatsNewItems = result.whatsNewItems.models[0].get('data');
            _.each(result.whatsNewItems, function processItem(item) {
                var dateAg = timeAgo(new Date(item.date.year, item.date.month - 1, item.date.day, item.date.hour, item.date.minute, item.date.second));
                item.date.since = dateAg;
            });
            result.firstItem = result.whatsNewItems[0];
            result.dictionary = dictionary;
            callback(err, result);
        });
    }
};

