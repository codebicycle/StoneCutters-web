'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var breadcrumb = require('../../../../../modules/breadcrumb');
var config = require('../../../../../../shared/config');

module.exports = Base.extend({
    className: 'items_show_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        data.category_name = this.options.category_name;

        if (!data.item.purged) {
            data.item.location.stateName = data.item.location.children[0].name;
            data.item.location.cityName = data.item.location.children[0].children[0].name;
            data.item.location.countryName = data.item.location.name;
            if(data.item.location.children[0].children[0].children[0]){
                data.item.location.neighborhoodName = data.item.location.children[0].children[0].children[0].name;
            }
            data.item.descriptionReplace = data.item.description.replace(/(<([^>]+)>)/ig,'');
        }

        var location = this.app.session.get('location');
        var flagItem = config.getForMarket(location.url, ['flagItem']);

        return _.extend({}, data, {
            breadcrumb: breadcrumb.get.call(this, data),
            flagItem: flagItem
        });
    }
});

module.exports.id = 'items/show';
