'use strict';

var _ = require('underscore');
var Base = require('../../bases/view');
var config = require('../../../../../../shared/config');

module.exports = Base.extend({
    className: 'items_list_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var platform = this.app.session.get('platform');
        var showBetterDealOptions = config.getForMarket(location.url, ['showBetterDeal', platform]);
        var showBetterDeal = false;

        if(showBetterDealOptions.enabled && _.contains(showBetterDealOptions.categories, data.item.category.parentId)) {
            showBetterDeal = true;
        }

        console.log(showBetterDeal);

        return _.extend({}, data, {
            showBetterDeal: showBetterDeal
        });
    }
});

module.exports.id = 'items/list';
