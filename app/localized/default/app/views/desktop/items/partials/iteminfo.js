'use strict';

var Base = require('../../../../../../common/app/bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'item-info',
    id: 'item-info',
    tagName: 'ul',

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var currentYear = new Date().getFullYear();
        var yearToShow;

        if (data.item.date.year < currentYear) {
            yearToShow = data.item.date.year;
        }


        return _.extend({}, data, {
            yearToShow: yearToShow
        });
    }

});

module.exports.id = 'items/partials/iteminfo';
