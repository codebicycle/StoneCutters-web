'use strict';

var _ = require('underscore');
var Base = require('../../bases/view');
var helpers = require('../../../../../helpers');
var breadcrumb = require('../../../../../modules/breadcrumb');
var config = require('../../../../../../shared/config');

module.exports = Base.extend({
    className: 'searches_allresults_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var platform = this.app.session.get('platform');
        var location = this.app.session.get('location');
        var betterDealEnabled = config.getForMarket(location.url, ['showBetterDeal', platform, 'enabled'], false);
        
        console.log("allresults.js");

        if (betterDealEnabled)
            this.addBetterDeal(data.items);

        return _.extend({}, data, {
            breadcrumb: breadcrumb.get.call(this, data),
            filtersEnabled: helpers.features.isEnabled.call(this, 'listingFilters')
        });
    },
    addBetterDeal: function(items) {
        var platform = this.app.session.get('platform');
        var location = this.app.session.get('location');
        var betterDealCategories = config.getForMarket(location.url, ['showBetterDeal', platform, 'categories'], []);

        _.each(items, function(item){
            console.log(item.id, item.condition);
            if (item.condition && item.condition === 'used' && _.contains(betterDealCategories, item.category.parentId))
                item.betterDeal = true;
            // console.log(item.category.parentId, item.condition, betterDealCategories, _.contains(betterDealCategories, item.category.parentId));
        });
    }
});

module.exports.id = 'searches/allresults';
