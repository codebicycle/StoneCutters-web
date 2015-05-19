'use strict';

var _ = require('underscore');
var Base = require('../../bases/view');
var breadcrumb = require('../../../../../modules/breadcrumb');
var config = require('../../../../../../shared/config');
var userzoom = require('../../../../../modules/userzoom');
var helpers = require('../../../../../../app/helpers');

module.exports = Base.extend({
    className: 'items_show_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var sellerProfileEnabled =  helpers.features.isEnabled.call(this, 'sellerProfile');
        var formatMonth;
        var location = this.app.session.get('location');
        var platform = this.app.session.get('platform');
        var flagItem = config.getForMarket(location.url, ['flagItem']);
        var safetyTips = config.getForMarket(location.url, ['safetyTips', platform]);
        var accepExchange = config.getForMarket(location.url, ['accepExchange', platform]);
        var showBetterDeal;

        if(accepExchange.enabled && !_.contains(config.getForMarket(location.url, ['accepExchange', platform, 'categories'], []), data.item.category.id)) {
            accepExchange.enabled = false;
        }

        data.category_name = this.options.category_name;

        if (config.getForMarket(location.url, ['showBetterDeal', platform, 'enabled'], false)) {
            if (_.contains(config.getForMarket(location.url, ['showBetterDeal', platform, 'categories'], []), data.item.category.parentId)) {
                showBetterDeal = !!data.item.used;
            }
        }
        if (sellerProfileEnabled && data.item.user && data.item.user.firstActivityDate ) {
            if (data.item.user.firstActivityDate.month < 10) {
                formatMonth = 'messages_date_format.90' + data.item.user.firstActivityDate.month;
            } else {
                formatMonth = 'messages_date_format.9' + data.item.user.firstActivityDate.month;
            }
        }
        this.userzoom = new userzoom({}, {
            app: this.app
        });
        if (!data.item.purged) {
            data.item.location.stateName = data.item.location.children[0].name;
            data.item.location.cityName = data.item.location.children[0].children[0].name;
            data.item.location.countryName = data.item.location.name;
            if(data.item.location.children[0].children[0].children[0]){
                data.item.location.neighborhoodName = data.item.location.children[0].children[0].children[0].name;
            }
            data.item.descriptionReplace = data.item.description.replace(/(<([^>]+)>)/ig,'');
        }
        return _.extend({}, data, {
            breadcrumb: breadcrumb.get.call(this, data),
            flagItem: flagItem,
            isUserzoomEnabled: this.userzoom.isEnabled(),
            userzoom: this.userzoom.getParams(),
            sellerProfileEnabled: sellerProfileEnabled,
            safetyTips: safetyTips,
            formatMonth: formatMonth,
            showBetterDeal: showBetterDeal,
            accepExchange: accepExchange
        });
    }
});

module.exports.id = 'items/show';
