'use strict';

var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'items_galery_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);
        data.category_name = this.options.category_name;
        data.item.location.stateName = data.item.location.children[0].name;
        data.item.location.cityName = data.item.location.children[0].children[0].name;
        data.item.description = data.item.description.replace(/(<([^>]+)>)/ig,'');

        return data;
    }

});

module.exports.id = 'items/galery';
